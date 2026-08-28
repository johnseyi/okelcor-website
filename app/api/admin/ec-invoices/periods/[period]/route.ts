import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** PATCH — finance.manage. Filing status: draft | ready | submitted. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ period: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { period } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/ec-invoices/periods/${encodeURIComponent(period)}`, tk, { method: "PATCH", body });
}
