import { forward } from "@/lib/partner-proxy";

export const dynamic = "force-dynamic";

/** POST — dispute a sale. `note` is required upstream; the partner needs to
 *  know what is wrong with the entry. A 422 passes straight through. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return forward(`/partner-sales/${id}/dispute`, { method: "POST", body: JSON.stringify(body) });
}
