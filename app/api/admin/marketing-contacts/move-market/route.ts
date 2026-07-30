/**
 * POST /api/admin/marketing-contacts/move-market
 * → POST /admin/marketing-contacts/move-market   (permission: marketing.manage)
 *
 * Body — `to_market` required, plus at least one selector (they are OR'd):
 *   {
 *     to_market:   "Germany",     // slugified server-side → "germany"
 *     contact_ids: [12, 45],      // checkbox selection
 *     emails:      ["a@b.com"],   // paste-a-list, no id lookup
 *     from_market: "TEST"         // move an ENTIRE market at once
 *   }
 *
 * 200 → { data: { to_market, moved, already_in_place, not_found[], contacts[] }, message }
 * 422  → to_market missing, or no selector given
 *
 * A contact belongs to exactly one market, so this is the only way to put an
 * existing address under a different one — the add form can't do it. Nothing
 * is created or deleted here: unmatched emails come back in `not_found`, and
 * unsubscribed contacts keep their status and token.
 *
 * `from_market` + `to_market` is effectively a market rename; the old market
 * then disappears from /marketing-contacts/markets on its own, since that
 * list is derived from live data. There is no delete-market endpoint and none
 * is needed — this is the cleanup path for a leftover test market.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

export async function POST(req: NextRequest) {
  const store = await cookies();
  const tk = store.get("admin_token")?.value;
  if (!tk) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE}/marketing-contacts/move-market`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tk}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) return NextResponse.json({ error: "Session expired." }, { status: 401 });

    // Unlike the read endpoints, a mutation must not degrade to a fake success —
    // reporting "moved" when nothing moved would be worse than an honest error.
    if (res.status === 404 || res.status === 405) {
      return NextResponse.json(
        { error: "Moving contacts between markets isn't available on this server yet." },
        { status: 501 },
      );
    }

    const json = await res.json().catch(() => ({ error: "Unreadable response from server." }));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the API server." }, { status: 502 });
  }
}
