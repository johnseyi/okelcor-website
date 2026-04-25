import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

async function apiFetch(path: string, token: string, params?: Record<string, string>) {
  try {
    const url = new URL(`${BASE}${path}`);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json().catch(() => null);
  } catch {
    return null;
  }
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toDate(iso: string): string {
  return (iso ?? "").slice(0, 10);
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now      = new Date();
  const today    = dateStr(now);
  const yd       = new Date(now); yd.setDate(yd.getDate() - 1);
  const yesterday = dateStr(yd);

  const [ordersRes, quotesRes, productsRes] = await Promise.all([
    apiFetch("/orders",          token, { per_page: "500", sort: "latest" }),
    apiFetch("/quote-requests",  token, { per_page: "200", sort: "latest" }),
    apiFetch("/products",        token, { per_page: "300", is_active: "1" }),
  ]);

  // ── Orders ────────────────────────────────────────────────────────────────
  type RawOrder = {
    id: number; order_ref: string; customer_name: string; customer_email: string;
    total: number | string; status: string; created_at: string;
  };
  const orders: RawOrder[] = Array.isArray(ordersRes?.data) ? ordersRes.data : [];

  const todayOrders     = orders.filter(o => toDate(o.created_at) === today);
  const yesterdayOrders = orders.filter(o => toDate(o.created_at) === yesterday);

  const sum = (arr: RawOrder[]) => arr.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const revenueToday     = sum(todayOrders);
  const revenueYesterday = sum(yesterdayOrders);
  const ordersToday      = todayOrders.length;
  const ordersYesterday  = yesterdayOrders.length;
  const avgOrderValueToday     = ordersToday     > 0 ? revenueToday     / ordersToday     : 0;
  const avgOrderValueYesterday = ordersYesterday > 0 ? revenueYesterday / ordersYesterday : 0;

  const pendingOrders = orders.filter(
    o => o.status === "pending" || o.status === "confirmed" || o.status === "processing"
  ).length;

  // Revenue chart — last 7 days
  const revenueChart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const ds = dateStr(d);
    const rev = orders
      .filter(o => toDate(o.created_at) === ds)
      .reduce((s, o) => s + (Number(o.total) || 0), 0);
    return {
      date: d.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      revenue: Math.round(rev * 100) / 100,
    };
  });

  // Recent orders — last 5
  const recentOrders = orders.slice(0, 5).map(o => ({
    id:         o.id,
    ref:        o.order_ref,
    customer:   o.customer_name,
    email:      o.customer_email,
    total:      Number(o.total) || 0,
    status:     o.status,
    created_at: o.created_at,
  }));

  // ── Quotes ────────────────────────────────────────────────────────────────
  type RawQuote = {
    id: number; ref_number: string; full_name: string; company_name?: string;
    tyre_category: string; country: string; status: string; created_at: string;
  };
  const quotes: RawQuote[] = Array.isArray(quotesRes?.data) ? quotesRes.data : [];
  const openQuotes = quotes.filter(q => q.status === "new" || q.status === "reviewed").length;
  const pendingQuotesList = quotes
    .filter(q => q.status === "new" || q.status === "reviewed")
    .slice(0, 5)
    .map(q => ({
      id:            q.id,
      ref:           q.ref_number,
      name:          q.full_name,
      company:       q.company_name ?? null,
      tyre_category: q.tyre_category,
      country:       q.country,
      created_at:    q.created_at,
    }));

  // ── Products (low stock) ──────────────────────────────────────────────────
  type RawProduct = { id: number; name: string; brand: string; sku: string; inventory?: number | null };
  const products: RawProduct[] = Array.isArray(productsRes?.data) ? productsRes.data : [];
  const lowStock    = products.filter(p => p.inventory != null && p.inventory < 10);
  const lowStockCount = lowStock.length;
  const lowStockList  = lowStock.slice(0, 10).map(p => ({
    id:    p.id,
    name:  p.name,
    brand: p.brand,
    sku:   p.sku,
    stock: p.inventory ?? 0,
  }));

  return NextResponse.json({
    revenueToday,    revenueYesterday,
    ordersToday,     ordersYesterday,
    avgOrderValueToday, avgOrderValueYesterday,
    pendingOrders,   openQuotes,    lowStockCount,
    revenueChart,    recentOrders,
    pendingQuotesList, lowStockList,
    // no newCustomers — customers endpoint not reliably available
    newCustomersToday: 0, newCustomersYesterday: 0,
  });
}
