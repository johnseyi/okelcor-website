import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/staff-messages/{id}/reply
 *
 * Multipart, so attachments survive. Recipients are resolved by the API from
 * the parent message and cannot be set here — sending `to[]` is ignored
 * upstream, by design.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await adminToken();
  if (!token) return unauthorized();
  const { id } = await params;

  try {
    const formData = await request.formData();
    const res = await fetch(`${ADMIN_BASE}/staff-messages/${id}/reply`, {
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
