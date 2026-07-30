/**
 * POST /api/admin/marketing-contacts/add-to-market
 * → POST /admin/marketing-contacts/add-to-market   (permission: marketing.manage)
 *
 * Adds a market to contacts that keep the markets they already have — the
 * operation the marketer actually asked for ("I want this address in Germany
 * *too*"), which was impossible while a contact had a single market column.
 *
 * Body — `to_market` required, plus at least one selector (they are OR'd):
 *   { to_market, contact_ids?, emails?, from_market? }
 *
 * Idempotent: re-adding a market a contact is already in is reported as
 * `already_in_place` and never errors.
 *
 * 200 → { data: { to_market, added, already_in_place, not_found[], contacts[] }, message }
 */

import { proxyMarketOp } from "../market-op";

export const dynamic = "force-dynamic";

export const POST = proxyMarketOp("add-to-market");
