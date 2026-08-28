import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — finance.view. ?period=2026-Q3 or 2026-05; defaults to the current quarter. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/ec-invoices", tk, { search: req.nextUrl.searchParams });
}
