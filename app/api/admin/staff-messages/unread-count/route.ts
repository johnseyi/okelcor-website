import { NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

// GET /api/admin/staff-messages/unread-count — for the nav badge.
export async function GET() {
  const token = await adminToken();
  if (!token) return unauthorized();

  try {
    const res = await fetch(`${ADMIN_BASE}/staff-messages/unread-count`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
