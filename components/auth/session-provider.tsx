"use client";

/**
 * components/auth/session-provider.tsx
 *
 * Thin "use client" wrapper around NextAuth's SessionProvider.
 *
 * Why this file exists:
 *   NextAuth's SessionProvider uses React context and must run on the client.
 *   The root layout (app/layout.tsx) is a server component, so it cannot
 *   import SessionProvider directly. This wrapper marks the boundary,
 *   letting the server layout render it as a client island.
 *
 * Usage: added once in app/layout.tsx, wraps the entire <body>.
 * Any component in the tree can then call useSession() from next-auth/react.
 */

import { SessionProvider } from "next-auth/react";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
