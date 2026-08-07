import { forward } from "@/lib/partner-proxy";

export const dynamic = "force-dynamic";

/** POST — add a staff member to an existing partner organisation. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "invalid_request" }, { status: 400 });
  return forward(`/partners/${id}/users`, { method: "POST", body: JSON.stringify(body) });
}
