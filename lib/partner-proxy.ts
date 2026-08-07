/**
 * lib/partner-proxy.ts
 *
 * Shared plumbing for the Partner Sales Log admin proxy routes.
 *
 * Same convention as the rest of this codebase: the browser never calls the
 * Laravel API directly, the admin bearer token stays in an httpOnly cookie and
 * is attached server-side, and `API_URL` (private) is preferred over the
 * public var.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

export async function adminToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("admin_token")?.value ?? null;
}

/**
 * Forward a request upstream and hand the response back untouched.
 *
 * Upstream status codes are preserved rather than collapsed: a 422 carrying
 * `errors.currency` or a required dispute note has to reach the form that can
 * show it. Only genuine transport failures become 502.
 */
export async function forward(
  path: string,
  init: RequestInit = {}
): Promise<NextResponse> {
  const token = await adminToken();
  if (!token) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });

    const body = await res.json().catch(() => ({}));
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }
}

/** Copy only the filters the upstream endpoint understands. */
export function pickQuery(url: string, keys: string[]): string {
  const incoming = new URL(url).searchParams;
  const out = new URLSearchParams();
  for (const k of keys) {
    const v = incoming.get(k);
    if (v) out.set(k, v);
  }
  const qs = out.toString();
  return qs ? `?${qs}` : "";
}
