import { forward } from "@/lib/partner-proxy";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forward(`/partner-sales/${id}/verify`, { method: "POST" });
}
