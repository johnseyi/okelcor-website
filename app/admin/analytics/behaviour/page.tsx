import BehaviourAnalytics from "@/components/admin/behaviour-analytics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customer behaviour" };

/**
 * Customer behaviour — what people search the catalogue for and what we can't
 * supply. Distinct from `/admin/analytics`, which is Google Analytics and
 * PostHog: that covers page views and click paths, which this report explicitly
 * does not. The two are complementary, and each says so.
 *
 * Route access is gated by the `behaviour` section in `admin-permissions.ts`
 * (middleware + shell), whose roles mirror the backend's `analytics.view`.
 */
export default function BehaviourAnalyticsPage() {
  return <BehaviourAnalytics />;
}
