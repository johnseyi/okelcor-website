import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * POST — finance.manage. Signs the calculation off. A 422 with
 * `code: no_revenue_invoice` means there is no figure to sign yet — forwarded
 * as-is so the panel can say so on the button.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/orders/${id}/profitability/verify`, tk, { method: "POST", body });
}

/** DELETE — finance.manage. Withdrawal requires a written reason. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/orders/${id}/profitability/verify`, tk, { method: "DELETE", body });
}
