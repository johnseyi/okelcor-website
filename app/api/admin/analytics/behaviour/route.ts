import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

/**
 * GET /api/admin/analytics/behaviour?days=30 | ?from=&to=
 *
 * Forwards the range params through untouched. `days` above 365 is a 422 upstream
 * and is surfaced as such rather than clamped here — silently changing the range
 * someone asked for is worse than telling them it was refused.
 *
 * Not degraded to an empty report on 404/405: "no data" and "not deployed" are
 * different statements, and an empty behaviour report reads as "customers aren't
 * searching". The panel distinguishes them from the status code.
 */
export async function GET(req: NextRequest) {
  const tk = (await cookies()).get("admin_token")?.value;
  if (!tk) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const incoming = req.nextUrl.searchParams;
  const qs = new URLSearchParams();
  for (const key of ["days", "from", "to"] as const) {
    const v = incoming.get(key);
    if (v) qs.set(key, v);
  }

  try {
    const res = await fetch(
      `${BASE}/analytics/behaviour${qs.size ? `?${qs}` : ""}`,
      {
        headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
        cache: "no-store",
      },
    );
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
