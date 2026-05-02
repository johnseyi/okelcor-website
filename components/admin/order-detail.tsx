"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, CheckCircle2, ChevronDown, Loader2,
  RefreshCw, MapPin, Ship, Clock, Package,
} from "lucide-react";
import { updateOrderStatus, cancelOrder, deleteOrder } from "@/app/admin/orders/actions";
import type { AdminOrderFull } from "@/lib/admin-api";

// ── Types ─────────────────────────────────────────────────────────────────────

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

interface TrackingEvent {
  date?:        string;
  timestamp?:   string;
  location?:    string;
  description?: string;
  status?:      string;
  event?:       string;
}

interface TrackingData {
  container_number?: string;
  status?:           string;
  vessel?:           string;
  location?:         string;
  eta?:              string;
  events?:           TrackingEvent[];
}

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

function shortDateOnly(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
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

// Convert an ISO or date-only string to YYYY-MM-DD for <input type="date">
function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  try { return new Date(iso).toISOString().slice(0, 10); } catch { return ""; }
}

// ── Tracking widget ───────────────────────────────────────────────────────────

function TrackingWidget({ containerNumber }: { containerNumber: string }) {
  const [data,    setData]    = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/tracking/${encodeURIComponent(containerNumber)}`);
      const json = await res.json() as { data?: TrackingData; error?: string } & TrackingData;
      console.log("Tracking response:", json);
      if (!res.ok) {
        setError(json.error ?? "No tracking data found for this container.");
      } else {
        setData(json.data ?? (json as TrackingData));
      }
    } catch {
      setError("Could not reach the tracking service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [containerNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
          Container Tracking
        </p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.8rem] text-[#5c5e62]">{containerNumber}</span>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-black/[0.09] bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-[#5c5e62] transition hover:border-[#E85C1A]/40 hover:text-[#E85C1A] disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={22} className="animate-spin text-[#9ca3af]" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[0.83rem] text-red-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && data && !(data.status || data.vessel || data.location || data.eta || data.events?.length) && (
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[0.83rem] text-blue-800">
            <Clock size={15} className="mt-0.5 shrink-0 text-blue-500" />
            Awaiting first tracking update from carrier — check back in a few hours.
          </div>
        )}

        {!loading && data && !!(data.status || data.vessel || data.location || data.eta || data.events?.length) && (
          <div className="space-y-5">
            {/* Summary chips */}
            <div className="flex flex-wrap gap-3">
              {data.status && (
                <div className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-[#fafafa] px-4 py-2.5">
                  <Package size={14} className="text-[#E85C1A]" />
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#5c5e62]">Status</p>
                    <p className="text-[0.83rem] font-semibold text-[#1a1a1a]">{data.status}</p>
                  </div>
                </div>
              )}
              {data.vessel && (
                <div className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-[#fafafa] px-4 py-2.5">
                  <Ship size={14} className="text-[#E85C1A]" />
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#5c5e62]">Vessel</p>
                    <p className="text-[0.83rem] font-semibold text-[#1a1a1a]">{data.vessel}</p>
                  </div>
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-[#fafafa] px-4 py-2.5">
                  <MapPin size={14} className="text-[#E85C1A]" />
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#5c5e62]">Location</p>
                    <p className="text-[0.83rem] font-semibold text-[#1a1a1a]">{data.location}</p>
                  </div>
                </div>
              )}
              {data.eta && (
                <div className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-[#fafafa] px-4 py-2.5">
                  <Clock size={14} className="text-[#E85C1A]" />
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#5c5e62]">ETA</p>
                    <p className="text-[0.83rem] font-semibold text-[#1a1a1a]">{shortDateOnly(data.eta)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Events timeline */}
            {!!data.events?.length && (
              <div>
                <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#5c5e62]">
                  Events Timeline
                </p>
                <ol className="relative border-l border-black/[0.08] pl-5 space-y-4">
                  {data.events.map((ev, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[1.35rem] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[#E85C1A] bg-white" />
                      <p className="text-[0.75rem] text-[#9ca3af]">
                        {shortDate(ev.date ?? ev.timestamp)}
                        {(ev.location) && (
                          <span className="ml-2 font-medium text-[#5c5e62]">· {ev.location}</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[0.83rem] font-medium text-[#1a1a1a]">
                        {ev.description ?? ev.event ?? ev.status ?? "—"}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OrderDetail({
  order,
  adminRole,
}: {
  order: AdminOrderFull;
  adminRole: string;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<OrderStatus>(
    ORDER_STATUSES.includes(order.status as OrderStatus)
      ? (order.status as OrderStatus)
      : "pending",
  );
  const [containerNumber, setContainerNumber] = useState(order.container_number ?? "");
  const [eta,             setEta]             = useState(toDateInputValue(order.eta));

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const [isPending, startTransition] = useTransition();

  // Cancel state
  const [cancelError,   setCancelError]   = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [isCancelPending, startCancelTransition] = useTransition();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteRef,       setDeleteRef]       = useState("");
  const [deleteError,     setDeleteError]     = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  // Role-based access
  const canCancel = ["admin", "order_manager", "super_admin"].includes(adminRole);
  const canDelete = adminRole === "super_admin";
  const cancelDisabled = ["cancelled", "delivered"].includes(status);

  const isDirty =
    status          !== order.status                     ||
    containerNumber !== (order.container_number ?? "")   ||
    eta             !== toDateInputValue(order.eta);

  const handleSave = () => {
    setSaveError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status, {
        container_number: containerNumber || undefined,
        eta:              eta             || undefined,
      });
      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.push("/admin/orders");
      }
    });
  };

  const handleCancel = () => {
    setCancelError(null);
    setCancelSuccess(false);
    startCancelTransition(async () => {
      const result = await cancelOrder(order.id);
      if (result.error) {
        setCancelError(result.error);
      } else {
        setCancelSuccess(true);
        setStatus("cancelled");
        setTimeout(() => setCancelSuccess(false), 4000);
      }
    });
  };

  const handleDelete = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteOrder(order.id, deleteRef);
      if (result.error) {
        setDeleteError(result.error);
      } else if (result.deleted) {
        router.push("/admin/orders");
      }
    });
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteRef("");
    setDeleteError(null);
  };

  // ── Active container to show the tracking widget
  // Use the saved value (order prop) not the input state, so the widget
  // only renders for a container that's already persisted on the order.
  const savedContainer = order.container_number;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Status + Shipment update card ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
          Order Status &amp; Shipment
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
            Order updated successfully.
          </div>
        )}

        <div className="flex flex-wrap items-end gap-4">
          {/* Current status badge */}
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">Current</span>
            <StatusBadge status={order.status} />
          </div>

          {/* Status dropdown */}
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">New status</span>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="h-10 appearance-none rounded-xl border border-black/[0.09] bg-white pl-3.5 pr-9 text-[0.875rem] font-semibold text-[#1a1a1a] outline-none transition focus:border-[#E85C1A] focus:ring-2 focus:ring-[#E85C1A]/10"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#5c5e62]" />
            </div>
          </div>

          {/* Container number */}
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">Container number</span>
            <input
              type="text"
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value)}
              placeholder="e.g. MSCU1234567"
              className="h-10 w-44 rounded-xl border border-black/[0.09] bg-white px-3.5 font-mono text-[0.875rem] text-[#1a1a1a] outline-none placeholder:font-sans placeholder:text-[#aaa] transition focus:border-[#E85C1A] focus:ring-2 focus:ring-[#E85C1A]/10"
            />
          </div>

          {/* ETA */}
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">ETA</span>
            <input
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="h-10 rounded-xl border border-black/[0.09] bg-white px-3.5 text-[0.875rem] text-[#1a1a1a] outline-none transition focus:border-[#E85C1A] focus:ring-2 focus:ring-[#E85C1A]/10"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="h-10 self-end rounded-full bg-[#E85C1A] px-6 text-[0.875rem] font-semibold text-white transition hover:bg-[#d14f14] disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
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
            <InfoRow label="Name"    value={order.customer_name} />
            <InfoRow label="Email"   value={order.customer_email} />
            <InfoRow label="Phone"   value={order.phone} />
            <InfoRow label="Company" value={order.company_name} />
            <InfoRow label="Country" value={order.country} />
            <InfoRow label="Address" value={order.address} />
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
            <InfoRow label="Order Ref"        value={order.order_ref} />
            <InfoRow label="Payment Method"   value={order.payment_method} />
            <InfoRow label="Placed On"        value={shortDate(order.created_at)} />
            <InfoRow label="Last Updated"     value={shortDate(order.updated_at)} />
            <InfoRow label="Container No."    value={order.container_number} />
            <InfoRow label="Tracking Status"  value={order.tracking_status} />
            <InfoRow label="ETA"              value={shortDateOnly(order.eta)} />
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

      {/* ── Container tracking widget (only when container_number is saved on order) ── */}
      {savedContainer && <TrackingWidget containerNumber={savedContainer} />}

      {/* ── Order Actions ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#5c5e62]">
          Order Actions
        </p>

        <div className="flex flex-wrap gap-3">
          {canCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelPending || cancelDisabled}
              className="h-9 rounded-full border border-amber-300 bg-amber-50 px-5 text-[0.83rem] font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              title={cancelDisabled ? `Order is already ${status}` : undefined}
            >
              {isCancelPending ? "Cancelling…" : "Cancel Order"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            disabled={!canDelete}
            className="h-9 rounded-full border border-red-200 bg-red-50 px-5 text-[0.83rem] font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            title={!canDelete ? "Only super admins can delete orders" : undefined}
          >
            Delete Order
          </button>
        </div>

        {cancelError && (
          <div className="mt-3 flex items-center gap-2 text-[0.83rem] text-red-600">
            <AlertCircle size={14} className="shrink-0" />
            {cancelError}
          </div>
        )}
        {cancelSuccess && (
          <div className="mt-3 flex items-center gap-2 text-[0.83rem] text-emerald-600">
            <CheckCircle2 size={14} className="shrink-0" />
            Order cancelled successfully.
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <p className="mb-1 text-[0.75rem] font-bold uppercase tracking-[0.15em] text-red-600">
              Delete Order
            </p>
            <p className="mb-5 text-[0.875rem] text-[#1a1a1a]">
              This is permanent and cannot be undone. Type the order reference to confirm.
            </p>

            <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">
              Order Reference
            </p>
            <input
              type="text"
              value={deleteRef}
              onChange={(e) => setDeleteRef(e.target.value)}
              placeholder={order.order_ref}
              autoFocus
              className="mb-4 h-10 w-full rounded-xl border border-black/[0.09] bg-white px-3.5 font-mono text-[0.875rem] text-[#1a1a1a] outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />

            {deleteError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-[0.83rem] text-red-700">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeletePending}
                className="h-9 rounded-full border border-black/[0.09] bg-white px-5 text-[0.83rem] font-semibold text-[#5c5e62] transition hover:border-black/20 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeletePending || deleteRef !== order.order_ref}
                className="h-9 rounded-full bg-red-600 px-5 text-[0.83rem] font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletePending ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
