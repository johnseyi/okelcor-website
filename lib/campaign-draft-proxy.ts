/**
 * Shared bits for the three `/api/admin/campaign-drafts` proxy routes.
 *
 * Server-only — reads the admin cookie. Kept out of the route files because
 * Next validates App Router route exports and rejects anything that isn't a
 * handler or a recognised config field.
 */

import { cookies } from "next/headers";

export const DRAFTS_BASE = `${
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
}/admin/campaign-drafts`;

export async function adminToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("admin_token")?.value ?? null;
}

/**
 * 404/405 — endpoints not deployed. 500 — deployed, but migration #29 hasn't
 * run, which is the state backend told us to expect first. All three mean the
 * same thing to the composer: there is nowhere to save yet, so turn autosave
 * off quietly instead of flashing an error every few seconds.
 *
 * Once #29 is applied this over-reads a genuine server fault as "unavailable".
 * That trade is deliberate and time-boxed: the alternative is an alarming
 * error on a timer during the exact window backend said to expect failures.
 */
export function isDraftStorageUnavailable(status: number): boolean {
  return status === 404 || status === 405 || status === 500;
}

export const UNAVAILABLE_BODY = {
  error: "Autosave isn't available on this server yet (migration #29).",
  code: "draft_storage_unavailable",
} as const;
