import { NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/staff-messages/{id} — one message plus its thread.
 *
 * A message you are not on comes back 404, not 403 — that is the API's
 * choice, deliberately, so an id cannot be probed for existence. Pass it
 * through rather than translating it.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await adminToken();
  if (!token) return unauthorized();
  const { id } = await params;

  try {
    const res = await fetch(`${ADMIN_BASE}/staff-messages/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
