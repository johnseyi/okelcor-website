"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { updateOrderStatus } from "@/app/admin/orders/actions";

// Defined here (not imported from "use server" file) so this array is
// available at runtime in the client bundle.
const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];
import type { AdminOrderFull } from "@/lib/admin-api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[0.75rem] font-bold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function shortDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch { return iso; }
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">{label}</p>
      <p className="text-[0.875rem] text-[#1a1a1a]">{value}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OrderDetail({ order }: { order: AdminOrderFull }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(
    ORDER_STATUSES.includes(order.status as OrderStatus)
      ? (order.status as OrderStatus)
      : "pending"
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isDirty = status !== order.status;

  const handleSave = () => {
    setSaveError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status);
      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.push("/admin/orders");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Status update card ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
          Order Status
        </p>

        {saveError && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.83rem] text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            {saveError}
          </div>
        )}
        {saved && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[0.83rem] text-emerald-700">
            <CheckCircle2 size={15} className="shrink-0" />
            Status updated successfully.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[0.83rem] text-[#5c5e62]">Current:</span>
            <StatusBadge status={order.status} />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="h-10 appearance-none rounded-xl border border-black/[0.09] bg-white pl-3.5 pr-9 text-[0.875rem] font-semibold text-[#1a1a1a] outline-none transition focus:border-[#E85C1A] focus:ring-2 focus:ring-[#E85C1A]/10"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#5c5e62]" />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="h-10 rounded-full bg-[#E85C1A] px-6 text-[0.875rem] font-semibold text-white transition hover:bg-[#d14f14] disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save Status"}
          </button>
        </div>
      </div>

      {/* ── Two-column: customer info + order summary ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Customer info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-5 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
            Customer Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow label="Name"         value={order.customer_name} />
            <InfoRow label="Email"        value={order.customer_email} />
            <InfoRow label="Phone"        value={order.phone} />
            <InfoRow label="Company"      value={order.company_name} />
            <InfoRow label="Country"      value={order.country} />
            <InfoRow label="Address"      value={order.address} />
          </div>
          {order.notes && (
            <div className="mt-4 rounded-xl bg-[#f5f5f5] px-4 py-3">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">Notes</p>
              <p className="mt-1 text-[0.875rem] text-[#1a1a1a]">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-5 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
            Order Summary
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow label="Order Ref"       value={order.order_ref} />
            <InfoRow label="Payment Method"  value={order.payment_method} />
            <InfoRow label="Placed On"       value={shortDate(order.created_at)} />
            <InfoRow label="Last Updated"    value={shortDate(order.updated_at)} />
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f5f5f5] px-4 py-3">
            <span className="text-[0.83rem] font-semibold text-[#5c5e62]">Order Total</span>
            <span className="text-[1.15rem] font-extrabold text-[#1a1a1a]">
              €{Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Order items ── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-black/[0.06] px-6 py-4">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
            Order Items
          </p>
        </div>
        {!order.items?.length ? (
          <p className="px-6 py-8 text-center text-[0.875rem] text-[#5c5e62]">
            No item details available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-black/[0.05] bg-[#fafafa]">
                  {["Product", "SKU", "Size", "Qty", "Unit Price", "Subtotal"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#5c5e62]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3">
                      <p className="text-[0.875rem] font-semibold text-[#1a1a1a]">{item.product_name}</p>
                      {item.brand && <p className="text-[0.73rem] text-[#5c5e62]">{item.brand}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.78rem] text-[#5c5e62]">
                      {item.sku ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[0.83rem] text-[#5c5e62]">
                      {item.size ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[0.875rem] font-semibold text-[#1a1a1a]">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-[0.875rem] text-[#1a1a1a]">
                      €{Number(item.unit_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-[0.875rem] font-semibold text-[#1a1a1a]">
                      €{Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-black/[0.06] bg-[#fafafa]">
                  <td colSpan={5} className="px-4 py-3 text-right text-[0.83rem] font-bold uppercase tracking-wide text-[#5c5e62]">
                    Total
                  </td>
                  <td className="px-4 py-3 text-[0.95rem] font-extrabold text-[#1a1a1a]">
                    €{Number(order.total).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
