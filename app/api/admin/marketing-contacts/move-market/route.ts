/**
 * POST /api/admin/marketing-contacts/move-market
 * → POST /admin/marketing-contacts/move-market   (permission: marketing.manage)
 *
 * Relocates contacts rather than adding a market alongside what they have
 * (that's add-to-market).
 *
 * Body — `to_market` required, plus at least one selector (they are OR'd):
 *   { to_market, contact_ids?, emails?, from_market? }
 *
 * With `from_market`: the contact leaves that market and keeps its others.
 * Without: its markets are replaced outright.
 * `from_market` + `to_market` alone is a market rename — the old market then
 * disappears from /marketing-contacts/markets on its own, since that list is
 * derived from live data. There is no delete-market endpoint and none is
 * needed; this is the cleanup path for a leftover test market.
 *
 * 200 → { data: { to_market, moved, already_in_place, not_found[], contacts[] }, message }
 */

import { proxyMarketOp } from "../market-op";

export const dynamic = "force-dynamic";

export const POST = proxyMarketOp("move-market");
