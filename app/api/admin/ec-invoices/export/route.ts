import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET — finance.view + orders.export. The BOM-prefixed CSV audit file, piped
 * through with Content-Disposition preserved; the button is hidden
 * client-side for readers without the export permission.
 */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();

  const url = new URL(`${ADMIN_BASE}/ec-invoices/export`);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${tk}`, Accept: "text/csv,application/json" },
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
    headers.set("Content-Type", res.headers.get("Content-Type") ?? "text/csv; charset=utf-8");
    const cd = res.headers.get("Content-Disposition");
    if (cd) headers.set("Content-Disposition", cd);
    return new NextResponse(body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
