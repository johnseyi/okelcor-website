import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET — `staff.view_team`. Everyone's period side by side.
 *
 * A 403 here is a real answer, not a failure: the caller may read their own
 * record and not a colleague's. Forwarded with its status so the page can say
 * that rather than showing a generic error.
 */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/staff/team-report", tk, { search: req.nextUrl.searchParams });
}
