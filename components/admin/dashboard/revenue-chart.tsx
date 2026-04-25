"use client";
import { useCallback, useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

type ChartPoint = { date: string; revenue: number };

function SkeletonChart() {
  return (
    <div className="flex h-[180px] items-end gap-2 px-2 pb-2">
      {[60, 40, 80, 55, 90, 45, 70].map((h, i) => (
        <div key={i} className="flex-1 animate-pulse rounded-t-sm bg-[#e5e7eb]" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 shadow-lg">
      <p className="text-[0.72rem] font-semibold text-[#5c5e62]">{label}</p>
      <p className="text-[0.9rem] font-extrabold text-[#E85C1A]">
        €{Number(payload[0]?.value ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function RevenueChart() {
  const [data, setData]     = useState<ChartPoint[] | null>(null);
  const [loading, setLoad]  = useState(true);
  const [total, setTotal]   = useState(0);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard/stats", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null).catch(() => null);
    if (res?.revenueChart) {
      setData(res.revenueChart);
      setTotal(res.revenueChart.reduce((s: number, p: ChartPoint) => s + p.revenue, 0));
    }
    setLoad(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-black/[0.06] px-5 py-4">
        <div>
          <p className="text-[0.9rem] font-extrabold text-[#1a1a1a]">Revenue — Last 7 Days</p>
          {!loading && (
            <p className="mt-0.5 text-[0.78rem] text-[#5c5e62]">
              Total: <strong className="text-[#1a1a1a]">
                €{total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </p>
          )}
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff1ec]">
          <span className="text-[0.7rem] font-black text-[#E85C1A]">7D</span>
        </div>
      </div>
      <div className="px-2 py-3">
        {loading ? (
          <SkeletonChart />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data ?? []} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#E85C1A" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#E85C1A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#E85C1A"
                strokeWidth={2}
                fill="url(#revGrad)"
                dot={{ r: 3, fill: "#E85C1A", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#E85C1A" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
