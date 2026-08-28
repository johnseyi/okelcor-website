import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET — finance.view. The § 18a ELSTER XML payload, piped through. The panel
 * fetches it as text to show in the review modal, and offers the same bytes
 * as a .xml download.
 */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();

  const url = new URL(`${ADMIN_BASE}/ec-invoices/elster`);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${tk}`, Accept: "text/xml,application/json" },
      cache: "no-store",
    });

    const body = await res.text();
    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") ?? "text/xml; charset=utf-8");
    const cd = res.headers.get("Content-Disposition");
    if (cd) headers.set("Content-Disposition", cd);
    return new NextResponse(body, { status: res.status, headers });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
