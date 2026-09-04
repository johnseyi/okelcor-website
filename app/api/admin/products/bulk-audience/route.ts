import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** POST — products.edit. Survey (dry_run) or apply a bulk audience change. */
export async function POST(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const body = await req.json().catch(() => ({}));
  return forward("/products/bulk-audience", tk, { method: "POST", body });
}
