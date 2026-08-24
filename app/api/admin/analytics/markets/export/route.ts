import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

/**
 * GET /api/admin/analytics/markets/export?from=&to=  → CSV download.
 *
 * Streamed back as bytes with Content-Disposition preserved. The file carries
 * a UTF-8 BOM so Excel does not mangle accented country names — decoding it to
 * a string and re-encoding here would be the easiest way to lose that.
 */
export async function GET(req: NextRequest) {
  const tk = (await cookies()).get("admin_token")?.value;
  if (!tk) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const incoming = req.nextUrl.searchParams;
  const qs = new URLSearchParams();
  for (const key of ["from", "to"] as const) {
    const v = incoming.get(key);
    if (v) qs.set(key, v);
  }

  try {
    const res = await fetch(`${BASE}/analytics/markets/export${qs.size ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "text/csv,*/*" },
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse(await res.text(), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await res.arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") ?? "text/csv; charset=UTF-8");
    const cd = res.headers.get("Content-Disposition");
    if (cd) headers.set("Content-Disposition", cd);

    return new NextResponse(body, { status: 200, headers });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
