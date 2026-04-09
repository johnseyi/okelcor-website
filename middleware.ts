import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Pages each role can access (beyond /admin dashboard which is always allowed)
const ROLE_ROUTES: Record<string, string[]> = {
  super_admin: [],  // unrestricted — only role that can access /admin/users
  admin: [
    "/admin/products", "/admin/articles", "/admin/orders", "/admin/quotes",
    "/admin/hero-slides", "/admin/brands", "/admin/settings", "/admin/profile",
  ],
  editor: [
    "/admin/products", "/admin/articles", "/admin/hero-slides",
    "/admin/brands", "/admin/settings", "/admin/profile",
  ],
  order_manager: ["/admin/orders", "/admin/quotes", "/admin/profile"],
};

function roleCanAccess(role: string, pathname: string): boolean {
  if (pathname === "/admin" || pathname === "/admin/unauthorized") return true;
  const allowed = ROLE_ROUTES[role];
  if (!allowed) return false;               // unknown role — deny
  if (allowed.length === 0) return true;    // super_admin / admin — allow all
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Role-based access guard
    const role = request.cookies.get("admin_role")?.value ?? "";
    if (role && !roleCanAccess(role, pathname)) {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  // Customer protected routes
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const signInUrl = new URL("/auth", request.url);

    // Use internal path instead of full absolute URL
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/shop",
    "/shop/:path*",
    "/checkout",
    "/account",
    "/account/:path*",
    "/admin",
    "/admin/:path*",
  ],
};