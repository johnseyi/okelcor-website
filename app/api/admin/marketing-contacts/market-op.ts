/**
 * Shared proxy for the three marketing-contact market operations
 * (add-to-market / move-market / remove-from-market).
 *
 * They take the same OR'd selectors (`contact_ids` / `emails` / `from_market`)
 * and return the same `{ data: { …counts, not_found[], contacts[] }, message }`
 * envelope, so the only thing that differs is the path — colocated here rather
 * than duplicated three times.
 *
 * Not a route: only `route.ts` in the app directory becomes an endpoint.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { MarketingContactMarketOp } from "@/lib/admin-api";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

export function proxyMarketOp(op: MarketingContactMarketOp) {
  return async function POST(req: NextRequest) {
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
      const res = await fetch(`${BASE}/marketing-contacts/${op}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tk}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) return NextResponse.json({ error: "Session expired." }, { status: 401 });

      // Every other proxy here degrades a 404/405 to an empty-but-OK response.
      // For a mutation that would be a lie — reporting success when nothing
      // changed is worse than an honest error — so this one stays loud.
      if (res.status === 404 || res.status === 405) {
        return NextResponse.json(
          { error: "Market operations aren't available on this server yet." },
          { status: 501 },
        );
      }

      const json = await res.json().catch(() => ({ error: "Unreadable response from server." }));
      return NextResponse.json(json, { status: res.status });
    } catch {
      return NextResponse.json({ error: "Could not reach the API server." }, { status: 502 });
    }
  };
}
