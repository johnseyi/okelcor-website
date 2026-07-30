/**
 * POST /api/admin/bulk-emails/preview → POST /admin/bulk-emails/preview
 *
 * Renders blocks (or body_html) without creating anything. Returns
 * `{ html, html_personalized, text, subject_personalized, unknown_merge_tags }`.
 *
 * The preview pane calls this on a debounce, so a 422 from half-finished
 * blocks is expected and normal — it's passed straight through for the editor
 * to attach per-block, not treated as an error state.
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
    const res = await fetch(`${BASE}/bulk-emails/preview`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tk}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) return NextResponse.json({ error: "Session expired." }, { status: 401 });
    if (res.status === 404 || res.status === 405) {
      return NextResponse.json(
        { error: "Live preview isn't available on this server yet." },
        { status: 501 },
      );
    }

    const json = await res.json().catch(() => ({ error: "Unreadable response from server." }));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the API server." }, { status: 502 });
  }
}
