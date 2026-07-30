/**
 * GET /api/admin/campaign-design → GET /admin/campaign-design
 *
 * The schema the block editor is generated from: block types with per-field
 * types/options/defaults, theme presets, merge tags, inline-format syntax.
 * Nothing about block types is hardcoded in the frontend, so one added
 * server-side appears in the editor on its own.
 *
 * Degrades to an empty schema rather than erroring — the composer then falls
 * back to the plain HTML path and says why, instead of showing a dead canvas.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

export async function GET() {
  const store = await cookies();
  const tk = store.get("admin_token")?.value;
  if (!tk) return NextResponse.json({ data: null }, { status: 200 });

  try {
    const res = await fetch(`${BASE}/campaign-design`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ data: null }, { status: 200 });
    const json = await res.json().catch(() => ({ data: null }));
    return NextResponse.json(json, { status: 200 });
  } catch {
    return NextResponse.json({ data: null }, { status: 200 });
  }
}
