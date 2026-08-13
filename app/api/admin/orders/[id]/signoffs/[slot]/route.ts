import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** DELETE — withdraw a signature. `reason` is required by the server. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; slot: string }> },
) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id, slot } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/orders/${id}/signoffs/${slot}`, tk, { method: "DELETE", body });
}
