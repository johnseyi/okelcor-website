import { NextRequest, NextResponse } from "next/server";
import { SHOP_REQUIRES_LOGIN } from "@/lib/flags";
import { canAccessSection, PATH_SECTION } from "@/lib/admin-permissions";

// Paths accessible to every authenticated admin regardless of role.
const ADMIN_ALWAYS_ALLOWED = [
  "/admin",
  "/admin/unauthorized",
  "/admin/profile",
  "/admin/change-password",
  "/admin/security",    // all roles can visit to manage own 2FA
];

function roleCanAccess(role: string, pathname: string, permissions?: string[] | null): boolean {
  if (ADMIN_ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }
  if (role === "super_admin") return true;

  // Derive from the canonical maps — permissions (per-user overrides) first,
  // ROLE_ACCESS as fallback.
  const section = Object.entries(PATH_SECTION).find(([path]) =>
    pathname.startsWith(path)
  )?.[1];

  if (!section) return true;    // path not mapped — pass through
  if (!role) return false;      // unknown/missing role — deny
  return canAccessSection(role, section, permissions);
}

// ── Middleware ────────────────────────────────────────────────────────────────

const PROTECTED_ROUTES = ["/shop", "/checkout", "/account"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Prefetch requests are speculative — never redirect them. The actual
  // navigation will be checked. Redirecting prefetches causes Next.js to
  // cache the redirect and replay it even after the cookie is present.
  if (request.headers.get("Next-Router-Prefetch") === "1") {
    return NextResponse.next();
  }

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const adminToken = request.cookies.get("admin_token")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const role = request.cookies.get("admin_role")?.value ?? "";

    // A token with no role cookie is a session from before the role cookie
    // existed — and it used to FAIL OPEN here, which is how a finance user's
    // forgotten tab sat on /admin/products for five days generating 1,178
    // permission denials against the API. Unknown role now re-authenticates
    // once (login refreshes the cookies) instead of passing unchecked.
    if (!role) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("reauth", "1");
      return NextResponse.redirect(loginUrl);
    }

    // Effective permissions from login (per-user overrides included).
    const permsCookie = request.cookies.get("admin_perms")?.value;
    const permissions = permsCookie ? permsCookie.split(",").filter(Boolean) : null;
    if (!roleCanAccess(role, pathname, permissions)) {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  // ── Customer protected routes ─────────────────────────────────────────────
  const isProtected = SHOP_REQUIRES_LOGIN && PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected) {
    const token = request.cookies.get("customer_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/shop/:path*",
    "/checkout/:path*",
    "/account/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
