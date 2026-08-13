import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET /admin/operations/invoice-reconciliation?from=&to=&channel= — finance.view */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/operations/invoice-reconciliation", tk, { search: req.nextUrl.searchParams });
}
