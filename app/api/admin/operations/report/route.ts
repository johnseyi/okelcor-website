import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET /admin/operations/report — orders.view. Carries `series`, chart-shaped. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/operations/report", tk, { search: req.nextUrl.searchParams });
}
