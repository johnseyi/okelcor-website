import { NextRequest } from "next/server";
import { adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/**
 * PUT — finance.manage. Upserts one week ('2026-W35'): bank_balance,
 * expected_in, expected_out, notes. A key that is not a real ISO week, or is
 * more than a year out, comes back 422 — forwarded as-is.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ weekKey: string }> }) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  const { weekKey } = await params;
  const body = await req.json().catch(() => ({}));
  return forward(`/finance/liquidity/${encodeURIComponent(weekKey)}`, tk, { method: "PUT", body });
}
