/**
 * Shared plumbing for admin proxy routes.
 *
 * Every admin call goes through a Next route handler so the browser never holds
 * the API token. These three helpers are the parts that were being retyped in
 * each route file: the base URL (private `API_URL` first — never
 * `NEXT_PUBLIC_API_URL` alone in server code), the cookie read, and the
 * pass-through that preserves the upstream status.
 *
 * **Status codes are forwarded, never flattened.** The whole of session 83
 * depends on the caller telling 403 (a role problem) from 409 (a state
 * problem), and a proxy that collapses both to 500 makes that impossible.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const ADMIN_BASE = `${
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
}/admin`;

export async function adminToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("admin_token")?.value ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Forward to the API and return its JSON and status untouched. */
export async function forward(
  path: string,
  token: string,
  init: { method?: string; body?: unknown; search?: URLSearchParams } = {},
) {
  const url = new URL(`${ADMIN_BASE}${path}`);
  init.search?.forEach((v, k) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
