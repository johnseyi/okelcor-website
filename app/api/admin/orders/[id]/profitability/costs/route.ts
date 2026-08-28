import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * POST — finance.manage. Adds a cost line (supplier invoice or fee). JSON, or
 * multipart when the supplier's PDF rides along on the same request.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
    }
    try {
      const res = await fetch(`${ADMIN_BASE}/orders/${id}/profitability/costs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
        body: form,
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      return NextResponse.json(json, { status: res.status });
    } catch {
      return NextResponse.json({ error: "Network error" }, { status: 502 });
    }
  }

  const body = await req.json().catch(() => ({}));
  return forward(`/orders/${id}/profitability/costs`, tk, { method: "POST", body });
}
