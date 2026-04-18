import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getCustomerFromCookie } from "@/lib/get-customer";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track your Okelcor orders.",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  product_name: string;
  brand?: string;
  size?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type Order = {
  ref: string;
  created_at: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  carrier?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  container_number?: string;
  tracking_status?: string;
  eta?: string;
};

// ─── Status badge config ──────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  pending:    { label: "Pending",    cls: "bg-gray-100 text-gray-600" },
  processing: { label: "Processing", cls: "bg-blue-100 text-blue-700" },
  shipped:    { label: "Shipped",    cls: "bg-orange-100 text-[#f4511e]" },
  delivered:  { label: "Delivered",  cls: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-100 text-red-600" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchOrders(token: string, email: string): Promise<Order[]> {
  const API_URL =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000/api/v1";

  const url = `${API_URL}/orders?email=${encodeURIComponent(email)}`;
  console.log("[orders] fetching:", url);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    console.log("[orders] status:", res.status, "data length:", Array.isArray(json.data) ? json.data.length : json);

    if (!res.ok) {
      console.error("[orders] API error:", res.status, json);
      return [];
    }

    return json.data ?? [];
  } catch (err) {
    console.error("[orders] fetch failed:", err);
    return [];
  }
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrdersPage() {
  const customer = await getCustomerFromCookie();
  if (!customer) redirect("/login?callbackUrl=/account/orders");

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value ?? "";

  const orders = await fetchOrders(token, customer.email);

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      <div className="tesla-shell pb-16 pt-[96px]">
        {/* Page header */}
        <div className="mb-8">
          <nav className="mb-4 flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)]">
            <Link href="/" className="transition hover:text-[var(--foreground)]">Home</Link>
            <ChevronRight size={13} className="opacity-50" />
            <span className="font-medium text-[var(--foreground)]">My Orders</span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
            My Orders
          </h1>
          <p className="mt-1 text-[0.88rem] text-[var(--muted)]">{customer.email}</p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center rounded-[22px] bg-[#efefef] px-8 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e0e0e0]">
              <Package size={30} strokeWidth={1.5} className="text-[var(--muted)]" />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-[var(--foreground)]">No orders yet</h2>
            <p className="mt-2 max-w-[340px] text-[0.9rem] text-[var(--muted)]">
              When you place an order it will appear here.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-[46px] items-center rounded-full bg-[var(--primary)] px-7 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] bg-[#efefef]">

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/[0.07]">
                    {["Order Ref", "Date", "Items", "Total", "Status", ""].map((h) => (
                      <th key={h} className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr
                      key={order.ref}
                      className={`border-b border-black/[0.05] transition hover:bg-white/60 ${i % 2 === 0 ? "bg-white/30" : ""}`}
                    >
                      <td className="px-6 py-4 font-mono text-[0.88rem] font-bold text-[var(--foreground)]">
                        {order.ref}
                      </td>
                      <td className="px-6 py-4 text-[0.88rem] text-[var(--muted)]">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="max-w-[220px] px-6 py-4 text-[0.88rem] text-[var(--muted)]">
                        <span className="font-medium text-[var(--foreground)]">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </span>
                        {order.items[0] && (
                          <span className="ml-1 truncate">
                            · {[order.items[0].brand, order.items[0].product_name].filter(Boolean).join(" ")}
                            {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[0.88rem] font-semibold text-[var(--foreground)]">
                        €{Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/account/orders/${order.ref}`}
                          className="inline-flex h-[36px] items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-[0.8rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                        >
                          Track Order <ChevronRight size={14} strokeWidth={2.2} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col divide-y divide-black/[0.06] md:hidden">
              {orders.map((order) => (
                <div key={order.ref} className="px-5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.88rem] font-bold text-[var(--foreground)]">{order.ref}</p>
                      <p className="mt-0.5 text-[0.78rem] text-[var(--muted)]">{formatDate(order.created_at)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-2 text-[0.82rem] text-[var(--muted)]">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    {order.items[0] && (
                      <> · {[order.items[0].brand, order.items[0].product_name].filter(Boolean).join(" ")}</>
                    )}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[0.95rem] font-extrabold text-[var(--foreground)]">
                      €{Number(order.total).toFixed(2)}
                    </p>
                    <Link
                      href={`/account/orders/${order.ref}`}
                      className="inline-flex h-[36px] items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-[0.8rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                    >
                      Track <ChevronRight size={13} strokeWidth={2.2} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
