"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

type Order = {
  id: number; ref: string; customer: string; email: string;
  total: number; status: string; created_at: string;
};

const STATUS: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  processing: "bg-cyan-100 text-cyan-700",
};

function Badge({ s }: { s: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.67rem] font-bold capitalize ${STATUS[s] ?? "bg-gray-100 text-gray-500"}`}>
      {s}
    </span>
  );
}

function Row({ o }: { o: Order }) {
  return (
    <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-[#fafafa]">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#1a1a1a]">
          {o.ref}
          <Badge s={o.status} />
        </p>
        <p className="mt-0.5 truncate text-[0.73rem] text-[#5c5e62]">{o.customer}</p>
      </div>
      <p className="shrink-0 text-[0.85rem] font-bold text-[#1a1a1a]">
        €{Number(o.total).toFixed(2)}
      </p>
    </Link>
  );
}

const REFRESH = 30_000;

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoad]  = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard/stats", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null).catch(() => null);
    if (res?.recentOrders) setOrders(res.recentOrders);
    setLoad(false);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, REFRESH);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <p className="text-[0.9rem] font-extrabold text-[#1a1a1a]">Recent Orders</p>
        </div>
        <Link href="/admin/orders" className="text-[0.75rem] font-semibold text-[#E85C1A] hover:underline">
          View all →
        </Link>
      </div>
      <div className="divide-y divide-black/[0.04]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-3">
              <div className="h-3.5 w-32 animate-pulse rounded bg-[#e5e7eb]" />
              <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-[#e5e7eb]" />
            </div>
          ))
        ) : orders?.length === 0 ? (
          <p className="px-5 py-8 text-center text-[0.83rem] text-[#5c5e62]">No orders yet.</p>
        ) : (
          orders?.map(o => <Row key={o.id} o={o} />)
        )}
      </div>
    </div>
  );
}
