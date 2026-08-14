import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET /admin/operations/clients/detail?email=… — orders.view.
 *
 * The address is a query parameter rather than a path segment on purpose: an
 * e-mail in a path means encoding dots, plus signs and slashes correctly through
 * every proxy between here and the API, which is a lot of ways to be wrong for
 * one identifier.
 *
 * A 404 `no_orders_in_period` is a real state — the client exists, just not in
 * this window — so it is forwarded rather than flattened into an empty list.
 */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/operations/clients/detail", tk, { search: req.nextUrl.searchParams });
}
