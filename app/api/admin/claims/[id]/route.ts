import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — claims.view. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  return forward(`/claims/${id}`, tk);
}

/** PATCH — claims.manage. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/claims/${id}`, tk, { method: "PATCH", body });
}

/** DELETE — claims.delete (super_admin only; the server refuses everyone else). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  return forward(`/claims/${id}`, tk, { method: "DELETE" });
}
