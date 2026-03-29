import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * middleware.ts
 *
 * Edge middleware — protects checkout and account routes.
 *
 * How it works:
 *   next-auth's `withAuth` helper reads the NextAuth JWT cookie at the edge.
 *   If the token is absent/invalid on a protected route, the `authorized`
 *   callback returns false, triggering a redirect to the signIn page.
 *   The original URL is passed as `callbackUrl` so NextAuth redirects back
 *   after a successful sign-in.
 *
 * Protected routes (require authentication):
 *   /checkout
 *   /account
 *   /account/*
 *
 * Public routes (explicitly NOT protected — never listed in matcher):
 *   /           — homepage
 *   /shop       — product catalogue
 *   /shop/*     — product detail pages
 *   /news       — news listing
 *   /news/*     — article pages
 *   /about
 *   /contact
 *   /quote
 *   /auth       — sign-in / sign-up page itself
 *   /api/*      — API routes (NextAuth handles its own auth)
 */
export default withAuth(
  function middleware() {
    // If we reach here the user is authenticated — allow the request through.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // Return true  → request is allowed through.
        // Return false → redirect to signIn page (pages.signIn in lib/auth.ts = /auth).
        return token !== null;
      },
    },
    pages: {
      signIn: "/auth",
    },
  },
);

/**
 * matcher — only the paths that require authentication.
 * Next.js runs middleware ONLY on matched paths, so public routes are
 * never touched regardless of what the middleware logic does.
 */
export const config = {
  matcher: ["/checkout", "/account", "/account/:path*"],
};
