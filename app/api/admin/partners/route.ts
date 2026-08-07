import { forward, pickQuery } from "@/lib/partner-proxy";

export const dynamic = "force-dynamic";

/** GET /api/admin/partners — list partner organisations. */
export async function GET(request: Request) {
  return forward(`/partners${pickQuery(request.url, ["market", "status", "search", "page"])}`);
}

/**
 * POST /api/admin/partners — create an organisation, optionally with its first
 * user. `owner.pin` is set by an admin, so the server marks the account
 * must_change_pin and the partner is forced to replace it on first sign-in.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "invalid_request" }, { status: 400 });
  return forward("/partners", { method: "POST", body: JSON.stringify(body) });
}
