import { NextRequest, NextResponse } from "next/server";

// ── Admin role table ──────────────────────────────────────────────────────────
// Keep in sync with lib/admin-permissions.ts ROLE_ACCESS map.
// super_admin: empty array means "allow all".

const ROLE_ROUTES: Record<string, string[]> = {
  super_admin:   [],
  admin:         [
    "/admin/products", "/admin/articles", "/admin/orders", "/admin/quotes",
    "/admin/hero-slides", "/admin/brands", "/admin/settings",
    "/admin/users", "/admin/supplier", "/admin/customers", "/admin/ebay", "/admin/analytics",
  ],
  editor:        [
    "/admin/articles", "/admin/hero-slides",
  ],
  order_manager: [
    "/admin/orders", "/admin/quotes", "/admin/supplier",
  ],
};

// Paths accessible to every authenticated admin regardless of role.
const ADMIN_ALWAYS_ALLOWED = [
  "/admin",
  "/admin/unauthorized",
  "/admin/profile",
  "/admin/change-password",
];

function roleCanAccess(role: string, pathname: string): boolean {
  if (ADMIN_ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }
  const allowed = ROLE_ROUTES[role];
  if (!allowed) return false;          // unknown role — deny
  if (allowed.length === 0) return true; // super_admin — allow all
  return allowed.some((prefix) => pathname.startsWith(prefix));
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
    if (role && !roleCanAccess(role, pathname)) {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  // ── Customer protected routes ─────────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) =>
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
