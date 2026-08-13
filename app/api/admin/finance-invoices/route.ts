import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — finance.view. Filters: from, to, channel, system, matched, q, per_page. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/finance-invoices", tk, { search: req.nextUrl.searchParams });
}

/**
 * POST — finance.manage.
 *
 * A duplicate `external_number` comes back as a 422 with
 * `errors.external_number`, which is forwarded as-is: the duplicate is the one
 * thing that would make the two sides of the board agree when they do not, so
 * the message belongs on the field rather than in a generic failure.
 */
export async function POST(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const body = await req.json().catch(() => ({}));
  return forward("/finance-invoices", tk, { method: "POST", body });
}
