import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** POST — finance.manage. Multipart: the line's invoice/proof document. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ lineId: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { lineId } = await params;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  try {
    const res = await fetch(`${ADMIN_BASE}/sales-orders/lines/${lineId}/file`, {
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
