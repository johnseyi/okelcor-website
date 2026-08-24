import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

// GET /api/admin/staff-messages?box=inbox|sent&unread=1&page=1
export async function GET(request: NextRequest) {
  const token = await adminToken();
  if (!token) return unauthorized();

  const incoming = new URL(request.url).searchParams;
  const out = new URLSearchParams();
  for (const key of ["box", "unread", "page", "per_page"]) {
    const value = incoming.get(key);
    if (value) out.set(key, value);
  }

  try {
    const res = await fetch(`${ADMIN_BASE}/staff-messages?${out}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}

/**
 * POST /api/admin/staff-messages — compose.
 *
 * Forwards the multipart body through untouched rather than re-encoding it as
 * JSON: attachments have to survive, and re-reading a file into a string here
 * would defeat the point. Same shape as the customer e-mail composer proxy.
 *
 * Status codes are preserved. 422 carries `errors.to` for an unknown or
 * deactivated recipient, and the composer needs to show it against the field.
 */
export async function POST(request: NextRequest) {
  const token = await adminToken();
  if (!token) return unauthorized();

  try {
    const formData = await request.formData();
    const res = await fetch(`${ADMIN_BASE}/staff-messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: formData,
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
