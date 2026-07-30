/**
 * POST /api/admin/marketing-contacts/remove-from-market
 * → POST /admin/marketing-contacts/remove-from-market   (permission: marketing.manage)
 *
 * Takes a contact out of one market without deleting the contact.
 *
 * Body — `market` required; `contact_ids` / `emails` optional. Omit both to
 * retire the market entirely (every contact leaves it).
 *
 * A contact always keeps at least one market: removing its last one is
 * refused and its email comes back in `skipped_last_market`. That is not a
 * failure — `removed: 0` with a non-empty list means "nothing happened, here's
 * why", and the fix is to move the contact elsewhere or delete it outright.
 *
 * 200 → { data: { market, removed, not_found[], skipped_last_market[], contacts[] }, message }
 */

import { proxyMarketOp } from "../market-op";

export const dynamic = "force-dynamic";

export const POST = proxyMarketOp("remove-from-market");
