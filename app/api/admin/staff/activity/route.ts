import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET — `staff.self`, which every role holds.
 *
 * Params: `admin_user_id` (defaults to the caller), `from`, `to`, `category`,
 * `per_page`. Asking for a colleague without `staff.view_team` comes back 403
 * with `code: staff_view_team_required` — forwarded untouched, because that
 * message names the missing permission and a flattened error would not.
 */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/staff/activity", tk, { search: req.nextUrl.searchParams });
}
