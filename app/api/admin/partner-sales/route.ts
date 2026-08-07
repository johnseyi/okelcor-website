import { forward, pickQuery } from "@/lib/partner-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return forward(
    `/partner-sales${pickQuery(request.url, [
      "partner", "market", "from", "to", "status", "currency", "include_deleted", "page", "per_page",
    ])}`
  );
}
