/**
 * PATCH  /api/admin/campaign-templates/[id] → PATCH  /admin/campaign-templates/{id}
 * DELETE /api/admin/campaign-templates/[id] → DELETE /admin/campaign-templates/{id}
 *
 * Saved designs only — the three starters are built in and can't be edited or
 * deleted, so the UI never offers those actions on them.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

async function forward(id: string, init: RequestInit, tk: string) {
  try {
    const res = await fetch(`${BASE}/campaign-templates/${id}`, {
      ...init,
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json", ...(init.headers ?? {}) },
    });

    if (res.status === 401) return NextResponse.json({ error: "Session expired." }, { status: 401 });
    if (res.status === 204) return NextResponse.json({ message: "Template removed." }, { status: 200 });
    if (res.status === 404 || res.status === 405) {
      return NextResponse.json(
        { error: "Saved templates aren't available on this server yet (migration #27)." },
        { status: 501 },
      );
    }

    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the API server." }, { status: 502 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  const tk = store.get("admin_token")?.value;
  if (!tk) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  return forward(id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, tk);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  const tk = store.get("admin_token")?.value;
  if (!tk) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  return forward(id, { method: "DELETE" }, tk);
}
