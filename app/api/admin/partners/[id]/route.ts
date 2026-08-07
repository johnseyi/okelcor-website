import { forward } from "@/lib/partner-proxy";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forward(`/partners/${id}`);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "invalid_request" }, { status: 400 });
  return forward(`/partners/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
