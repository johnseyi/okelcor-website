import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

/**
 * GET /api/admin/analytics/markets?from=&to=
 *
 * Not degraded to an empty report on 404/405, same reasoning as the behaviour
 * proxy: "no markets" and "not deployed" are different statements, and an empty
 * market table reads as "nobody is interested anywhere". The panel tells them
 * apart from the status code.
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
    const res = await fetch(`${BASE}/analytics/markets${qs.size ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
