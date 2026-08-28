import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — finance.view. Filters: from, to, channel, verified, has_revenue, q, per_page, page. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/finance/profitability", tk, { search: req.nextUrl.searchParams });
}
