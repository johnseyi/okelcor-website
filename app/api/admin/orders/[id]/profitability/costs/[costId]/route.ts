import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** PATCH — finance.manage. Editing the money withdraws a standing verification server-side. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; costId: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id, costId } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/orders/${id}/profitability/costs/${costId}`, tk, { method: "PATCH", body });
}

/** DELETE — finance.manage. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; costId: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id, costId } = await params;
  return forward(`/orders/${id}/profitability/costs/${costId}`, tk, { method: "DELETE" });
}
