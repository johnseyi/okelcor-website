import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — claims.view. Filters: status (default "open"), type, assignee, q. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/claims", tk, { search: req.nextUrl.searchParams });
}

/** POST — claims.manage. Logs a claim out of the e-mail thread it came from. */
export async function POST(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const body = await req.json().catch(() => ({}));
  return forward("/claims", tk, { method: "POST", body });
}
