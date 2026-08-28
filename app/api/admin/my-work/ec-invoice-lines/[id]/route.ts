import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * PATCH — the assignee's own status update on an EC invoice line. Being the
 * assignee is the authorization; no finance permission needed.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/my-work/ec-invoice-lines/${id}`, tk, { method: "PATCH", body });
}
