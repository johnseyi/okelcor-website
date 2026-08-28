import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — staff.self (every role). Filters: scope=all|mine|created, status, q. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/todos", tk, { search: req.nextUrl.searchParams });
}

/** POST — staff.self. Anyone can add and tag a teammate. */
export async function POST(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const body = await req.json().catch(() => ({}));
  return forward("/todos", tk, { method: "POST", body });
}
