import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** PUT — finance.manage. The Melder's own USt-IdNr. */
export async function PUT(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const body = await req.json().catch(() => ({}));
  return forward("/ec-invoices/company-vat", tk, { method: "PUT", body });
}
