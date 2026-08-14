import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * POST /admin/finance-invoices/{id}/file — finance.manage. Attach or replace.
 *
 * The incoming FormData is re-sent rather than the raw body piped: `fetch`
 * regenerates the multipart boundary from the object, so the two can't
 * disagree, which is the usual way a proxied upload arrives corrupt.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  try {
    const res = await fetch(`${ADMIN_BASE}/finance-invoices/${id}/file`, {
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
