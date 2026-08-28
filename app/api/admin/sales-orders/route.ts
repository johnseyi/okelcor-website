import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — finance.view. Filters: status=all|pending, period, segment, q. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/sales-orders", tk, { search: req.nextUrl.searchParams });
}

/** POST — finance.manage. A duplicate order number is a 422, forwarded as-is. */
export async function POST(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const body = await req.json().catch(() => ({}));
  return forward("/sales-orders", tk, { method: "POST", body });
}
