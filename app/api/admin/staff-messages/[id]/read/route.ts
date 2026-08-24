import { NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

// POST /api/admin/staff-messages/{id}/read
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await adminToken();
  if (!token) return unauthorized();
  const { id } = await params;

  try {
    const res = await fetch(`${ADMIN_BASE}/staff-messages/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
