import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Truck, Package } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CopyButton from "@/components/account/copy-button";
import { authOptions } from "@/lib/auth";
import { StatusBadge, formatDate, type Order, type OrderStatus } from "../page";

// ─── Timeline config ──────────────────────────────────────────────────────────

const TIMELINE_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending",    label: "Order Placed" },
  { key: "processing", label: "Processing"   },
  { key: "shipped",    label: "Shipped"       },
  { key: "delivered",  label: "Delivered"     },
];

const STEP_ORDER: Record<OrderStatus, number> = {
  pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1,
};

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchOrder(ref: string): Promise<Order | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  try {
    const res = await fetch(`${API_URL}/orders/${ref}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ ref: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params;
  return { title: `Order ${ref}` };
}

// ─── Timeline component ───────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-[14px] border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-[0.88rem] font-semibold text-red-700">
          This order has been cancelled.
        </p>
      </div>
    );
  }

  const currentIdx = STEP_ORDER[status] ?? 0;

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[480px] items-start gap-0 sm:min-w-0">
        {TIMELINE_STEPS.map((step, i) => {
          const stepIdx = STEP_ORDER[step.key] ?? i;
          const isDone    = stepIdx < currentIdx;
          const isCurrent = stepIdx === currentIdx;
          const isLast    = i === TIMELINE_STEPS.length - 1;

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {/* Connector left */}
                {i > 0 && (
                  <div className={`h-[3px] flex-1 transition-colors ${isDone || isCurrent ? "bg-[var(--primary)]" : "bg-black/10"}`} />
                )}

                {/* Circle */}
                <div
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-bold text-[0.78rem] transition-colors",
                    isDone
                      ? "border-green-500 bg-green-500 text-white"
                      : isCurrent
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-black/10 bg-white text-[var(--muted)]",
                  ].join(" ")}
                >
                  {isDone ? "✓" : i + 1}
                </div>

                {/* Connector right */}
                {!isLast && (
                  <div className={`h-[3px] flex-1 transition-colors ${isDone ? "bg-[var(--primary)]" : "bg-black/10"}`} />
                )}
              </div>

              {/* Label */}
              <p
                className={[
                  "mt-2 text-center text-[0.75rem] font-semibold",
                  isCurrent ? "text-[var(--primary)]" : isDone ? "text-green-600" : "text-[var(--muted)]",
                ].join(" ")}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrderDetailPage({ params }: Props) {
  const { ref } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect(`/auth?callbackUrl=/account/orders/${ref}`);

  const order = await fetchOrder(ref);
  if (!order) notFound();

  const subtotal = order.items.reduce((s, item) => s + Number(item.subtotal), 0);

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      <div className="tesla-shell pb-16 pt-[96px]">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)]">
          <Link href="/" className="transition hover:text-[var(--foreground)]">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/account/orders" className="transition hover:text-[var(--foreground)]">My Orders</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--foreground)]">{ref}</span>
        </nav>

        {/* Back button */}
        <Link
          href="/account/orders"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-[0.85rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
        >
          <ChevronLeft size={15} strokeWidth={2.2} /> Back to Orders
        </Link>

        <div className="flex flex-col gap-5">

          {/* ── Order summary header ── */}
          <div className="rounded-[22px] bg-[#efefef] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
                  Order Reference
                </p>
                <p className="mt-1 font-mono text-[1.35rem] font-extrabold tracking-wide text-[var(--foreground)]">
                  {order.ref}
                </p>
                <p className="mt-1 text-[0.85rem] text-[var(--muted)]">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={order.status} />
                <p className="text-[1.25rem] font-extrabold text-[var(--foreground)]">
                  €{Number(order.total).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Status timeline ── */}
          <div className="rounded-[22px] bg-[#efefef] p-6 sm:p-8">
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
              Order Status
            </p>
            <StatusTimeline status={order.status} />
          </div>

          {/* ── Shipment details ── */}
          <div className="rounded-[22px] bg-[#efefef] p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <Truck size={18} strokeWidth={1.9} className="text-[var(--primary)]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
                Shipment Details
              </p>
            </div>

            {order.tracking_number ? (
              <div className="flex flex-col gap-4">
                {order.carrier && (
                  <div>
                    <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted)]">Carrier</p>
                    <p className="mt-0.5 text-[0.95rem] font-semibold text-[var(--foreground)]">{order.carrier}</p>
                  </div>
                )}

                <div>
                  <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted)]">Tracking Number</p>
                  <div className="mt-1.5 flex items-center gap-2 rounded-[10px] border border-black/[0.08] bg-white px-4 py-2.5">
                    <p className="flex-1 font-mono text-[0.9rem] font-bold tracking-wide text-[var(--foreground)]">
                      {order.tracking_number}
                    </p>
                    <CopyButton value={order.tracking_number} />
                  </div>
                </div>

                {order.estimated_delivery && (
                  <div>
                    <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Estimated Delivery
                    </p>
                    <p className="mt-0.5 text-[0.95rem] font-semibold text-[var(--foreground)]">
                      {formatDate(order.estimated_delivery)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-[12px] border border-black/[0.06] bg-white/70 px-5 py-4">
                <Package size={18} strokeWidth={1.7} className="mt-0.5 shrink-0 text-[var(--muted)]" />
                <p className="text-[0.88rem] leading-6 text-[var(--muted)]">
                  Tracking details will appear here once your order is shipped.
                </p>
              </div>
            )}
          </div>

          {/* ── Order items table ── */}
          <div className="overflow-hidden rounded-[22px] bg-[#efefef]">
            <div className="border-b border-black/[0.07] px-6 py-5 sm:px-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
                Order Items
              </p>
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Product</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Size</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Qty</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Unit Price</th>
                    <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className={`border-b border-black/[0.04] ${i % 2 === 0 ? "bg-white/30" : ""}`}>
                      <td className="px-6 py-4">
                        {item.brand && (
                          <p className="text-[0.75rem] font-bold uppercase tracking-wider text-[var(--primary)]">
                            {item.brand}
                          </p>
                        )}
                        <p className="text-[0.9rem] font-semibold text-[var(--foreground)]">
                          {item.product_name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[0.88rem] text-[var(--muted)]">{item.size ?? "—"}</td>
                      <td className="px-6 py-4 text-[0.88rem] text-[var(--foreground)]">{item.quantity}</td>
                      <td className="px-6 py-4 text-[0.88rem] text-[var(--muted)]">
                        €{Number(item.unit_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-[0.9rem] font-semibold text-[var(--foreground)]">
                        €{Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-black/[0.08]">
                    <td colSpan={4} className="px-6 py-4 text-right text-[0.85rem] font-bold uppercase tracking-wider text-[var(--muted)]">
                      Total
                    </td>
                    <td className="px-6 py-4 text-right text-[1.1rem] font-extrabold text-[var(--foreground)]">
                      €{Number(order.total).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile */}
            <div className="flex flex-col divide-y divide-black/[0.05] md:hidden">
              {order.items.map((item, i) => (
                <div key={i} className="px-5 py-4">
                  {item.brand && (
                    <p className="text-[0.72rem] font-bold uppercase tracking-wider text-[var(--primary)]">
                      {item.brand}
                    </p>
                  )}
                  <p className="text-[0.9rem] font-semibold text-[var(--foreground)]">{item.product_name}</p>
                  {item.size && (
                    <p className="mt-0.5 text-[0.78rem] text-[var(--muted)]">{item.size}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[0.82rem] text-[var(--muted)]">
                      {item.quantity} × €{Number(item.unit_price).toFixed(2)}
                    </p>
                    <p className="font-semibold text-[var(--foreground)]">
                      €{Number(item.subtotal).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-[0.85rem] font-bold uppercase tracking-wider text-[var(--muted)]">Total</p>
                <p className="text-[1.05rem] font-extrabold text-[var(--foreground)]">
                  €{Number(order.total).toFixed(2)}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
