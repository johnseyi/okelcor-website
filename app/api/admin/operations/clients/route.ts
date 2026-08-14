import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET /admin/operations/clients — orders.view. Behind the board's Clients figure. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/operations/clients", tk, { search: req.nextUrl.searchParams });
}
