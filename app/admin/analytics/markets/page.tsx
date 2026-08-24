import MarketIntelligence from "@/components/admin/market-intelligence";

export const dynamic = "force-dynamic";
export const metadata = { title: "Market intelligence" };

/**
 * Which market to enter next.
 *
 * Sibling of /admin/analytics/behaviour and deliberately a different page for
 * a different reader: behaviour answers "what should we fix" (a product
 * question), this answers "where should we sell" (a business one). Sharing a
 * page would bury one under the other.
 *
 * Gated by the `behaviour` section in admin-permissions.ts, which mirrors the
 * backend's `analytics.view` and already includes the `marketing` role.
 */
export default function MarketIntelligencePage() {
  return <MarketIntelligence />;
}
