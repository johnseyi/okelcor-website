import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * NextAuth catch-all API handler.
 * Handles all /api/auth/* endpoints automatically:
 *   GET  /api/auth/session
 *   POST /api/auth/callback/credentials
 *   POST /api/auth/signout
 *   GET  /api/auth/csrf
 *   ...etc
 *
 * All configuration is in lib/auth.ts — this file stays minimal.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
