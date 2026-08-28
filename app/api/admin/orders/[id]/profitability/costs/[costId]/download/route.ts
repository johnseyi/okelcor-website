import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — finance.view. Binary passthrough of a cost line's document. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; costId: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id, costId } = await params;

  try {
    const res = await fetch(`${ADMIN_BASE}/orders/${id}/profitability/costs/${costId}/download`, {
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
