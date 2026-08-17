import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET — `staff.self`. Who this caller may look at.
 *
 * Returns just the caller without `staff.view_team`, so the picker renders the
 * same way for everyone rather than the frontend branching on a permission it
 * would have to be told about separately. `meta.can_view_team` and
 * `meta.can_verify` come back alongside for the controls that do differ.
 */
export async function GET() {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/staff/members", tk);
}
