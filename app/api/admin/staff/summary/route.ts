import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET — `staff.self`. Counts by category for the period.
 *
 * The payload deliberately carries no combined total: recorded work and
 * self-reported work are two objects and are never added together. Nothing here
 * reshapes that.
 */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/staff/summary", tk, { search: req.nextUrl.searchParams });
}
