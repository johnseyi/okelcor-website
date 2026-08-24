import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/communications/{id}/forward
 *
 * Forward a customer e-mail to a colleague. JSON, not multipart — the
 * forwarded message carries the original's attachments (copied server-side)
 * and the covering note is text, so there is nothing to upload.
 *
 * Requires `crm.view` upstream; a role without it gets 403 and the caller
 * needs to see that rather than a generic failure.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await adminToken();
  if (!token) return unauthorized();
  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${ADMIN_BASE}/communications/${id}/forward`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
