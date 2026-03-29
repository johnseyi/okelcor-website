import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * lib/auth.ts
 *
 * Central NextAuth configuration.
 * Exported as `authOptions` and used in two places:
 *   1. app/api/auth/[...nextauth]/route.ts  — API handler
 *   2. Any server component that calls getServerSession(authOptions)
 *
 * Session strategy: JWT (no database adapter required).
 * Sessions are stored in a signed HttpOnly cookie, not on the server.
 *
 * Provider: Credentials (email + password).
 * ── INTEGRATION POINT ──────────────────────────────────────────────────────
 * The `authorize` function below currently accepts any well-formed credentials
 * so the UI flow can be tested end-to-end before a real backend exists.
 * When a database is ready, replace the body of `authorize` with a real lookup:
 *
 *   const user = await db.users.findByEmail(credentials.email);
 *   if (!user) return null;
 *   const valid = await bcrypt.compare(credentials.password, user.passwordHash);
 *   return valid ? { id: user.id, name: user.name, email: user.email } : null;
 * ───────────────────────────────────────────────────────────────────────────
 */
export const authOptions: NextAuthOptions = {
  // ── Session ──────────────────────────────────────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ── JWT ──────────────────────────────────────────────────────────────────
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ── Providers ────────────────────────────────────────────────────────────
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // ── TODO: replace with real database lookup ──────────────────────
        // For now, any non-empty email + password (min 8 chars) is accepted.
        // This lets the full auth flow be tested before a DB is connected.
        const emailValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email);
        const passwordValid = credentials.password.length >= 8;
        if (!emailValid || !passwordValid) return null;

        return {
          id:    credentials.email,
          email: credentials.email,
          name:  credentials.email.split("@")[0],
        };
        // ────────────────────────────────────────────────────────────────
      },
    }),
  ],

  // ── Callbacks ────────────────────────────────────────────────────────────
  callbacks: {
    // Persist user id into the JWT token on sign-in.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Expose id on the session object available to server + client code.
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },

  // ── Pages ─────────────────────────────────────────────────────────────────
  // Point NextAuth at our existing /auth page instead of its default UI.
  pages: {
    signIn: "/auth",
  },

  // ── Security ─────────────────────────────────────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,
};
