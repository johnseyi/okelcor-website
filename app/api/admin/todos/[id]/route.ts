import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** PATCH — participants only; the server decides (creator/assignee). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/todos/${id}`, tk, { method: "PATCH", body });
}

/** DELETE — the creator's call, not the assignee's. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  return forward(`/todos/${id}`, tk, { method: "DELETE" });
}
