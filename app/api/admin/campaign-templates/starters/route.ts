/**
 * GET /api/admin/campaign-templates/starters
 * → GET /admin/campaign-templates/starters
 *
 * The three built-in designs (`okelcor_classic` is the full Wix layout). The
 * editor never opens on a blank canvas, so this is fetched up front.
 *
 * Starters reference placeholder image URLs that may not exist yet — the UI
 * shows those as "replace this image", not a broken thumbnail.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

export async function GET() {
  const store = await cookies();
  const tk = store.get("admin_token")?.value;
  if (!tk) return NextResponse.json({ data: [] }, { status: 200 });

  try {
    const res = await fetch(`${BASE}/campaign-templates/starters`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ data: [] }, { status: 200 });
    const json = await res.json().catch(() => ({ data: [] }));
    return NextResponse.json(json, { status: 200 });
  } catch {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
