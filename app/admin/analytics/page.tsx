import { redirect } from "next/navigation";
import {
  Users,
  MousePointerClick,
  Eye,
  Clock,
  TrendingUp,
  Globe,
  BarChart2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  adminApiFetch,
  AdminUnauthorizedError,
} from "@/lib/admin-api";
import {
  fetchGaOverview,
  fetchGaDailyTrend,
  fetchGaTopPages,
  fetchGaTrafficSources,
  fetchGaCountries,
} from "@/lib/google-analytics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={20} strokeWidth={1.8} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#5c5e62]">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-extrabold text-[#1a1a1a]">{value}</p>
        {sub && <p className="mt-0.5 text-[0.72rem] text-[#5c5e62]">{sub}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-black/[0.06] px-5 py-4">
        <Icon size={15} className="text-[#5c5e62]" />
        <p className="text-[0.9rem] font-extrabold text-[#1a1a1a]">{title}</p>
      </div>
      {children}
    </div>
  );
}

function MiniBarRow({ label, value, max, color = "bg-[#E85C1A]" }: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="px-5 py-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="max-w-[70%] truncate text-[0.82rem] text-[#1a1a1a]">{label}</span>
        <span className="text-[0.8rem] font-semibold text-[#5c5e62]">{fmtNum(value)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0f2f5]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Tiny sparkline (pure CSS, no chart lib) ───────────────────────────────────

function Sparkline({ data, field }: {
  data: { date: string; sessions: number; pageViews: number }[];
  field: "sessions" | "pageViews";
}) {
  if (data.length === 0) return null;

  const values = data.map((d) => d[field]);
  const max = Math.max(...values, 1);
  const W = 600;
  const H = 80;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area = `0,${H} ${polyline} ${W},${H}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-20 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E85C1A" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#E85C1A" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#grad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#E85C1A"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Not configured banner ─────────────────────────────────────────────────────

function NotConfigured() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
      <AlertCircle size={32} className="mx-auto mb-3 text-amber-500" />
      <p className="text-[0.95rem] font-extrabold text-[#1a1a1a]">
        Google Analytics not configured
      </p>
      <p className="mt-2 text-[0.83rem] leading-6 text-[#5c5e62]">
        Add the following environment variables to enable analytics data in the admin panel:
      </p>
      <div className="mx-auto mt-4 max-w-md rounded-xl bg-white px-5 py-4 text-left font-mono text-[0.78rem] text-[#1a1a1a] shadow-sm">
        <p className="text-green-600">GA_PROPERTY_ID=123456789</p>
        <p className="text-green-600">GOOGLE_SA_CLIENT_EMAIL=…</p>
        <p className="text-green-600">GOOGLE_SA_PRIVATE_KEY=&quot;-----BEGIN PRIVATE KEY…&quot;</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  // Auth guard
  try {
    await adminApiFetch("/products", { params: { per_page: 1 }, revalidate: false });
  } catch (e) {
    if (e instanceof AdminUnauthorizedError) redirect("/admin/login");
  }

  const isConfigured = !!(
    process.env.GA_PROPERTY_ID &&
    process.env.GOOGLE_SA_CLIENT_EMAIL &&
    process.env.GOOGLE_SA_PRIVATE_KEY
  );

  if (!isConfigured) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-7">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">Analytics</p>
          <p className="mt-1 text-[0.875rem] text-[#5c5e62]">Google Analytics 4 — last 28 days</p>
        </div>
        <NotConfigured />
      </div>
    );
  }

  // Parallel data fetch
  const [overview, trend, topPages, sources, countries] = await Promise.all([
    fetchGaOverview(28),
    fetchGaDailyTrend(28),
    fetchGaTopPages(28, 10),
    fetchGaTrafficSources(28, 8),
    fetchGaCountries(28, 8),
  ]);

  const maxPageViews = topPages[0]?.pageViews ?? 1;
  const maxSessions  = sources[0]?.sessions ?? 1;
  const maxCountry   = countries[0]?.sessions ?? 1;

  const SOURCE_COLORS: Record<string, string> = {
    "Organic Search":  "bg-green-500",
    "Direct":          "bg-blue-500",
    "Referral":        "bg-purple-500",
    "Organic Social":  "bg-pink-500",
    "Paid Search":     "bg-amber-500",
    "Email":           "bg-cyan-500",
  };

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
            Analytics
          </p>
          <p className="mt-1 text-[0.875rem] text-[#5c5e62]">
            Google Analytics 4 — last 28 days
          </p>
        </div>
        <a
          href={`https://analytics.google.com/analytics/web/#/p${process.env.GA_PROPERTY_ID}/reports/intelligenthome`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-black/[0.09] bg-white px-3.5 py-2 text-[0.8rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5]"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Open GA4
        </a>
      </div>

      {/* Stat cards */}
      {overview ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Active Users"  value={fmtNum(overview.activeUsers)}  icon={Users}            accent="bg-[#E85C1A]" />
          <StatCard label="Sessions"      value={fmtNum(overview.sessions)}      icon={MousePointerClick} accent="bg-blue-500" />
          <StatCard label="Page Views"    value={fmtNum(overview.pageViews)}     icon={Eye}              accent="bg-violet-500" />
          <StatCard label="Avg. Duration" value={fmtDuration(overview.avgSessionDuration)} icon={Clock} accent="bg-emerald-500" />
          <StatCard label="Bounce Rate"   value={`${overview.bounceRate}%`}      icon={TrendingUp}       accent="bg-amber-500" />
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.83rem] text-red-700">
          Could not load overview metrics — check your service account permissions.
        </div>
      )}

      {/* Trend chart */}
      {trend.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
            <p className="text-[0.9rem] font-extrabold text-[#1a1a1a]">Sessions — Last 28 Days</p>
            <BarChart2 size={15} className="text-[#5c5e62]" />
          </div>
          <div className="px-5 pt-4 pb-2">
            <Sparkline data={trend} field="sessions" />
          </div>
          <div className="flex justify-between border-t border-black/[0.04] px-5 py-3">
            <span className="text-[0.72rem] text-[#5c5e62]">{trend[0]?.date}</span>
            <span className="text-[0.72rem] text-[#5c5e62]">{trend[trend.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Lower grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Top pages */}
        <div className="lg:col-span-1">
          <SectionCard title="Top Pages" icon={Eye}>
            <div className="divide-y divide-black/[0.04]">
              {topPages.length === 0 ? (
                <p className="px-5 py-8 text-center text-[0.83rem] text-[#5c5e62]">No data.</p>
              ) : (
                topPages.map((page) => (
                  <MiniBarRow
                    key={page.path}
                    label={page.path}
                    value={page.pageViews}
                    max={maxPageViews}
                    color="bg-violet-500"
                  />
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* Traffic sources */}
        <div className="lg:col-span-1">
          <SectionCard title="Traffic Sources" icon={TrendingUp}>
            <div className="divide-y divide-black/[0.04]">
              {sources.length === 0 ? (
                <p className="px-5 py-8 text-center text-[0.83rem] text-[#5c5e62]">No data.</p>
              ) : (
                sources.map((src) => (
                  <MiniBarRow
                    key={src.source}
                    label={src.source}
                    value={src.sessions}
                    max={maxSessions}
                    color={SOURCE_COLORS[src.source] ?? "bg-[#E85C1A]"}
                  />
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* Countries */}
        <div className="lg:col-span-1">
          <SectionCard title="Top Countries" icon={Globe}>
            <div className="divide-y divide-black/[0.04]">
              {countries.length === 0 ? (
                <p className="px-5 py-8 text-center text-[0.83rem] text-[#5c5e62]">No data.</p>
              ) : (
                countries.map((c) => (
                  <MiniBarRow
                    key={c.country}
                    label={c.country}
                    value={c.sessions}
                    max={maxCountry}
                    color="bg-blue-500"
                  />
                ))
              )}
            </div>
          </SectionCard>
        </div>

      </div>
    </div>
  );
}
