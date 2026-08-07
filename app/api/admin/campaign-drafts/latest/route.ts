/**
 * GET /api/admin/campaign-drafts/latest → GET /admin/campaign-drafts/latest
 *
 * Backs the "restore your work?" offer when the composer opens.
 *
 * Backend returns `data: null` with a 200 — not a 404 — when there is nothing
 * worth restoring, including for a draft that is entirely empty. Anything
 * unexpected here is normalised to the same `data: null`, because the failure
 * mode to avoid is offering a restore that restores nothing: after that
 * happens twice she dismisses the prompt on sight, and the one time it holds
 * an hour of work it gets dismissed too.
 */

import { NextResponse } from "next/server";
import { DRAFTS_BASE, adminToken } from "@/lib/campaign-draft-proxy";

export const dynamic = "force-dynamic";

export async function GET() {
  const tk = await adminToken();
  if (!tk) return NextResponse.json({ data: null }, { status: 200 });

  try {
    const res = await fetch(`${DRAFTS_BASE}/latest`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ data: null }, { status: 200 });
    const json = await res.json().catch(() => ({ data: null }));
    return NextResponse.json({ data: json?.data ?? null }, { status: 200 });
  } catch {
    return NextResponse.json({ data: null }, { status: 200 });
  }
}
