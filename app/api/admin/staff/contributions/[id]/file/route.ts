import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** POST — `staff.self`, own entry, still pending. Attaches or replaces evidence. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  try {
    const res = await fetch(`${ADMIN_BASE}/staff/contributions/${id}/file`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      body: form,
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}

/**
 * GET — the evidence itself.
 *
 * Binary passthrough with `Content-Disposition` preserved: the file sits on a
 * private disk behind a token, so a plain `<a href>` to the API cannot reach it
 * and the bytes come through here instead. A 403 or 404 body is forwarded as-is
 * — both carry a readable reason.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;

  try {
    const res = await fetch(`${ADMIN_BASE}/staff/contributions/${id}/file`, {
      headers: {
        Authorization: `Bearer ${tk}`,
        Accept: "application/pdf,image/*,application/octet-stream,*/*",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
      });
    }

    const body = await res.arrayBuffer();
    const headers = new Headers();
    const ct = res.headers.get("Content-Type");
    const cd = res.headers.get("Content-Disposition");
    if (ct) headers.set("Content-Type", ct);
    if (cd) headers.set("Content-Disposition", cd);
    return new NextResponse(body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
