import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET /admin/finance-invoices/{id}/download — finance.view.
 *
 * Binary passthrough with `Content-Disposition` preserved: a token-protected
 * download cannot be driven by a plain `<a href>`, so the bytes come through
 * here. A 404 body is forwarded as-is — it carries a readable message when
 * nothing is attached.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;

  try {
    const res = await fetch(`${ADMIN_BASE}/finance-invoices/${id}/download`, {
      headers: {
        Authorization: `Bearer ${tk}`,
        Accept: "application/pdf,image/*,application/octet-stream,*/*",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
      });
    }

    const body = await res.arrayBuffer();
    const headers = new Headers();
    const ct = res.headers.get("Content-Type");
    const cd = res.headers.get("Content-Disposition");
    if (ct) headers.set("Content-Type", ct);
    if (cd) headers.set("Content-Disposition", cd);
    return new NextResponse(body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
