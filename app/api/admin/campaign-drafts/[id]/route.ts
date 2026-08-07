/**
 * GET    /api/admin/campaign-drafts/{id} → GET    /admin/campaign-drafts/{id}
 * PUT    /api/admin/campaign-drafts/{id} → PUT    /admin/campaign-drafts/{id}   ← autosave
 * DELETE /api/admin/campaign-drafts/{id} → DELETE /admin/campaign-drafts/{id}
 *
 * PUT is a **full replace**, and the body is passed through untouched. Nothing
 * is stripped, defaulted or merged on the way past: under merge semantics
 * deleting the last block would be inexpressible, so an absent key has to keep
 * meaning "empty". The composer always sends the whole editor document.
 *
 * Nothing is validated here either. Autosave has to accept half-built work —
 * a Button with no URL yet is the state most worth saving.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  DRAFTS_BASE, adminToken, isDraftStorageUnavailable, UNAVAILABLE_BODY,
} from "@/lib/campaign-draft-proxy";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tk = await adminToken();
  if (!tk) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const res = await fetch(`${DRAFTS_BASE}/${id}`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({ data: null }));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the API server." }, { status: 502 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tk = await adminToken();
  if (!tk) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const res = await fetch(`${DRAFTS_BASE}/${id}`, {
      method: "PUT",
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

    // A save either happened or it didn't — never reported as a success it wasn't.
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the API server." }, { status: 502 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tk = await adminToken();
  if (!tk) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const res = await fetch(`${DRAFTS_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
    });
    if (isDraftStorageUnavailable(res.status)) {
      return NextResponse.json(UNAVAILABLE_BODY, { status: 501 });
    }
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the API server." }, { status: 502 });
  }
}
