/**
 * GET  /api/admin/campaign-drafts → GET  /admin/campaign-drafts   (my drafts, light — no blocks)
 * POST /api/admin/campaign-drafts → POST /admin/campaign-drafts   (create once, when editing starts)
 *
 * Autosave for the campaign composer, under the same `marketing.manage`
 * permission as the rest of the marketing panel.
 *
 * **Degradation is asymmetric, on purpose.** Listing degrades to empty — a
 * drafts list that can't load is a missing convenience. Creating does not
 * degrade to a fake success: the point of a draft is that it exists on the
 * server, so handing back an id that isn't real would lose the work it claims
 * to be protecting.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  DRAFTS_BASE, adminToken, isDraftStorageUnavailable, UNAVAILABLE_BODY,
} from "@/lib/campaign-draft-proxy";

export const dynamic = "force-dynamic";

export async function GET() {
  const tk = await adminToken();
  if (!tk) return NextResponse.json({ data: [] }, { status: 200 });

  try {
    const res = await fetch(DRAFTS_BASE, {
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

export async function POST(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const res = await fetch(DRAFTS_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tk}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) return NextResponse.json({ error: "Session expired." }, { status: 401 });
    if (isDraftStorageUnavailable(res.status)) {
      return NextResponse.json(UNAVAILABLE_BODY, { status: 501 });
    }

    const json = await res.json().catch(() => ({ error: "Unreadable response from server." }));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the API server." }, { status: 502 });
  }
}
