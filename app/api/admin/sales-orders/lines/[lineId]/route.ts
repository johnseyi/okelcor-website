import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** PATCH — finance.manage. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ lineId: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { lineId } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/sales-orders/lines/${lineId}`, tk, { method: "PATCH", body });
}

/** DELETE — finance.manage. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ lineId: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { lineId } = await params;
  return forward(`/sales-orders/lines/${lineId}`, tk, { method: "DELETE" });
}
