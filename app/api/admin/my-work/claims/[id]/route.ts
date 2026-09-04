import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * PATCH — the assignee's half of the claims loop. No claims permission
 * needed: being the assignee IS the authorization (the server checks), the
 * same contract as finance items and EC invoice lines. Body: { status,
 * outcome_note? }.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/my-work/claims/${id}`, tk, { method: "PATCH", body });
}
