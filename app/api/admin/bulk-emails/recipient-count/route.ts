/**
 * GET /api/admin/bulk-emails/recipient-count
 * → GET /admin/bulk-emails/recipient-count?company=&country=&market=&markets[]=&status=&search=
 * Returns: { count: number }
 *
 * `markets` is repeatable (`?markets=a&markets=b`) and forwarded as Laravel's
 * `markets[]` array syntax. A contact belonging to several of the selected
 * markets is counted once, so this figure is the real send size — not a sum
 * of per-market counts, which would double-count.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

export async function GET(req: NextRequest) {
  const store = await cookies();
  const tk = store.get("admin_token")?.value;
  if (!tk) return NextResponse.json({ count: 0 }, { status: 200 });

  const incoming = req.nextUrl.searchParams;
  const allowed = ["company", "country", "market", "status", "search"] as const;
  const qs = new URLSearchParams();
  for (const key of allowed) {
    const v = incoming.get(key);
    if (v) qs.set(key, v);
  }
  for (const m of incoming.getAll("markets")) {
    if (m) qs.append("markets[]", m);
  }

  try {
    const res = await fetch(`${BASE}/bulk-emails/recipient-count?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ count: 0 }, { status: 200 });
    const json = await res.json().catch(() => ({ count: 0 }));
    return NextResponse.json({ count: json?.data?.count ?? json?.count ?? 0 }, { status: 200 });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
