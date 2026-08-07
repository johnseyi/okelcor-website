import { forward } from "@/lib/partner-proxy";

export const dynamic = "force-dynamic";

/**
 * PATCH — deactivate, reset PIN, or unlock a partner user.
 *
 * A PIN reset re-arms the server's must_change_pin gate and deletes that
 * user's tokens, so a reset prompted by a suspected compromise does not leave
 * the compromised device signed in.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "invalid_request" }, { status: 400 });
  return forward(`/partner-users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
