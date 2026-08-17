import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * PATCH — `staff.self`, own entry, still pending.
 *
 * A 409 `already_reviewed` means a manager has ruled on it and rewording it
 * would change what they agreed to. Forwarded with its code intact so the UI
 * can offer "add a correcting entry" instead of showing a generic failure.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/staff/contributions/${id}`, tk, { method: "PATCH", body });
}

/** DELETE — `staff.self`, own entry, still pending. Same 409 rule as PATCH. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  return forward(`/staff/contributions/${id}`, tk, { method: "DELETE" });
}
