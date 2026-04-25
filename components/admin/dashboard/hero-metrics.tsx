"use client";
import { useCallback, useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ShoppingCart, Users, Zap, BarChart2, DollarSign, Activity } from "lucide-react";
import { useCountUp } from "./count-up";

type Metrics = {
  revenueToday: number; revenueYesterday: number;
  ordersToday: number;  ordersYesterday: number;
  newCustomersToday: number; newCustomersYesterday: number;
  activeSessionsNow: number;
  sessionsToday: number;
  avgOrderValueToday: number; avgOrderValueYesterday: number;
};

function pctDelta(a: number, b: number): number | null {
  if (b === 0) return null;
  return Math.round(((a - b) / b) * 100);
}

function Trend({ current, prev, format = "number" }: { current: number; prev: number; format?: "number" | "currency" | "pct" }) {
  const delta = pctDelta(current, prev);
  if (delta === null) return <span className="text-[0.7rem] text-[#9ca3af]">no data</span>;
  const up = delta >= 0;
  const Icon = delta === 0 ? Minus : up ? TrendingUp : TrendingDown;
  const color = delta === 0 ? "text-[#9ca3af]" : up ? "text-emerald-600" : "text-red-500";
  return (
    <span className={`flex items-center gap-0.5 text-[0.72rem] font-semibold ${color}`}>
      <Icon size={11} strokeWidth={2.5} />
      {delta >= 0 ? "+" : ""}{delta}% vs yesterday
    </span>
  );
}

function fmt(n: number, type: "currency" | "number" | "pct") {
  if (type === "currency") return `€${n >= 1000 ? (n / 1000).toFixed(1) + "k" : n.toFixed(2)}`;
  if (type === "pct")      return `${n.toFixed(1)}%`;
  return n.toLocaleString();
}

function MetricCard({
  label, value, sub, icon: Icon, accent, trend, format = "number",
}: {
  label: string; value: number; sub?: string;
  icon: React.ElementType; accent: string;
  trend?: { current: number; prev: number };
  format?: "currency" | "number" | "pct";
}) {
  const animated = useCountUp(value);
  return (
    <div className="group flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={18} strokeWidth={1.8} className="text-white" />
        </div>
        {trend && <Trend current={trend.current} prev={trend.prev} />}
      </div>
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#5c5e62]">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold text-[#1a1a1a]">
          {format === "currency"
            ? `€${animated >= 1000 ? (animated / 1000).toFixed(1) + "k" : animated.toLocaleString()}`
            : format === "pct"
            ? `${animated}%`
            : animated.toLocaleString()}
        </p>
        {sub && <p className="mt-0.5 text-[0.7rem] text-[#9ca3af]">{sub}</p>}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-3 h-10 w-10 animate-pulse rounded-xl bg-[#e5e7eb]" />
      <div className="h-3 w-20 animate-pulse rounded bg-[#e5e7eb]" />
      <div className="mt-2 h-7 w-28 animate-pulse rounded bg-[#e5e7eb]" />
    </div>
  );
}

const REFRESH = 30_000;

export default function HeroMetrics() {
  const [m, setM]       = useState<Metrics | null>(null);
  const [loading, setL] = useState(true);

  const refresh = useCallback(async () => {
    const [statsRes, phRes] = await Promise.all([
      fetch("/api/admin/dashboard/stats",   { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/admin/posthog/dashboard", { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);
    const sessions = phRes?.sessionsToday ?? 0;
    const orders   = statsRes?.ordersToday ?? 0;
    setM({
      revenueToday:        statsRes?.revenueToday        ?? 0,
      revenueYesterday:    statsRes?.revenueYesterday    ?? 0,
      ordersToday:         orders,
      ordersYesterday:     statsRes?.ordersYesterday     ?? 0,
      newCustomersToday:   statsRes?.newCustomersToday   ?? 0,
      newCustomersYesterday: statsRes?.newCustomersYesterday ?? 0,
      activeSessionsNow:   phRes?.activeUsersNow         ?? 0,
      sessionsToday:       sessions,
      avgOrderValueToday:  statsRes?.avgOrderValueToday  ?? 0,
      avgOrderValueYesterday: statsRes?.avgOrderValueYesterday ?? 0,
    });
    setL(false);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, REFRESH);
    return () => clearInterval(t);
  }, [refresh]);

  if (loading) {
    return (
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const convRate = m && m.sessionsToday > 0
    ? Math.round((m.ordersToday / m.sessionsToday) * 1000) / 10
    : 0;

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <MetricCard
        label="Revenue Today"
        value={Math.round(m?.revenueToday ?? 0)}
        format="currency"
        icon={DollarSign}
        accent="bg-[#E85C1A]"
        trend={{ current: m?.revenueToday ?? 0, prev: m?.revenueYesterday ?? 0 }}
      />
      <MetricCard
        label="Orders Today"
        value={m?.ordersToday ?? 0}
        icon={ShoppingCart}
        accent="bg-blue-500"
        trend={{ current: m?.ordersToday ?? 0, prev: m?.ordersYesterday ?? 0 }}
      />
      <MetricCard
        label="New Customers"
        value={m?.newCustomersToday ?? 0}
        sub="today"
        icon={Users}
        accent="bg-violet-500"
        trend={{ current: m?.newCustomersToday ?? 0, prev: m?.newCustomersYesterday ?? 0 }}
      />
      <MetricCard
        label="Active Right Now"
        value={m?.activeSessionsNow ?? 0}
        sub="last 5 minutes"
        icon={Activity}
        accent="bg-emerald-500"
      />
      <MetricCard
        label="Conversion Rate"
        value={convRate}
        sub="orders / sessions"
        format="pct"
        icon={BarChart2}
        accent="bg-amber-500"
      />
      <MetricCard
        label="Avg Order Value"
        value={Math.round(m?.avgOrderValueToday ?? 0)}
        format="currency"
        icon={Zap}
        accent="bg-cyan-500"
        trend={{ current: m?.avgOrderValueToday ?? 0, prev: m?.avgOrderValueYesterday ?? 0 }}
      />
    </div>
  );
}
