import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * POST — `staff.verify`. Body: `{ decision: "verified" | "rejected", note? }`.
 *
 * Two refusals worth keeping legible rather than collapsing into one error:
 * 422 `self_review` (nobody countersigns their own claim) and a 422 validation
 * error on `note` when a rejection carries no reason.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/staff/contributions/${id}/review`, tk, { method: "POST", body });
}
