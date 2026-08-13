import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * GET — orders.view. The only source of `you_may_sign`: the block embedded on
 * the order detail is built by the shared `state()`, which does not add it.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  return forward(`/orders/${id}/signoffs`, tk);
}

/**
 * POST — `{ slot, note? }`.
 *
 * Entitlement is checked per slot inside the service rather than by route
 * middleware, because the two halves are held by different roles. So **403 is a
 * role problem and 409 is a state problem** — both are forwarded verbatim so
 * the panel can say which.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/orders/${id}/signoffs`, tk, { method: "POST", body });
}
