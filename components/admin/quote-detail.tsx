"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, ChevronDown, Paperclip, Download } from "lucide-react";
import { updateQuoteStatus } from "@/app/admin/quotes/actions";

// Defined here (not imported from "use server" file) so this array is
// available at runtime in the client bundle.
const QUOTE_STATUSES = ["new", "reviewed", "quoted", "closed"] as const;
type QuoteStatus = (typeof QUOTE_STATUSES)[number];
import type { AdminQuoteFull } from "@/lib/admin-api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  new:      "bg-orange-100 text-orange-700",
  reviewed: "bg-blue-100 text-blue-700",
  quoted:   "bg-emerald-100 text-emerald-700",
  closed:   "bg-gray-100 text-gray-500",
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

export default function QuoteDetail({ quote }: { quote: AdminQuoteFull }) {
  const router = useRouter();
  const [status, setStatus] = useState<QuoteStatus>(
    QUOTE_STATUSES.includes(quote.status as QuoteStatus)
      ? (quote.status as QuoteStatus)
      : "new"
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isDirty = status !== quote.status;

  const handleSave = () => {
    setSaveError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateQuoteStatus(quote.id, status);
      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.push("/admin/quotes");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Status update card ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
          Quote Status
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
            <StatusBadge status={quote.status} />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuoteStatus)}
              className="h-10 appearance-none rounded-xl border border-black/[0.09] bg-white pl-3.5 pr-9 text-[0.875rem] font-semibold text-[#1a1a1a] outline-none transition focus:border-[#E85C1A] focus:ring-2 focus:ring-[#E85C1A]/10"
            >
              {QUOTE_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
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

      {/* ── Two-column: requester info + request details ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Requester info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-5 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
            Requester Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow label="Full Name"    value={quote.full_name} />
            <InfoRow label="Email"        value={quote.email} />
            <InfoRow label="Phone"        value={quote.phone} />
            <InfoRow label="Company"      value={quote.company_name} />
            <InfoRow label="Country"      value={quote.country} />
          </div>
        </div>

        {/* Request details */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-5 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
            Request Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow label="Ref Number"        value={quote.ref_number} />
            <InfoRow label="Tyre Category"     value={quote.tyre_category} />
            <InfoRow label="Quantity"          value={quote.quantity} />
            <InfoRow label="Delivery Location" value={quote.delivery_location} />
            <InfoRow label="Submitted On"      value={shortDate(quote.created_at)} />
            <InfoRow label="Last Updated"      value={shortDate(quote.updated_at)} />
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      {quote.notes && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
            Additional Notes
          </p>
          <p className="whitespace-pre-wrap text-[0.875rem] leading-relaxed text-[#1a1a1a]">
            {quote.notes}
          </p>
        </div>
      )}

      {/* ── Attachment ── */}
      {quote.attachment_url ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
            Attached Specification Sheet
          </p>
          <div className="flex items-center justify-between rounded-xl border border-black/[0.07] bg-[#f8f8f8] px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <Paperclip size={15} strokeWidth={1.8} className="text-[#5c5e62]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[0.875rem] font-semibold text-[#1a1a1a]">
                  {quote.attachment_name ?? "Specification sheet"}
                </p>
                {quote.attachment_size != null && (
                  <p className="text-[0.72rem] text-[#5c5e62]">
                    {formatBytes(quote.attachment_size)}
                  </p>
                )}
              </div>
            </div>
            <a
              href={quote.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 flex shrink-0 items-center gap-1.5 rounded-full bg-[#E85C1A] px-4 py-2 text-[0.8rem] font-semibold text-white transition hover:bg-[#d14f14]"
            >
              <Download size={13} strokeWidth={2} />
              Download
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#E85C1A]">
            Specification Sheet
          </p>
          <p className="text-[0.83rem] text-[#5c5e62]">No attachment provided.</p>
        </div>
      )}

    </div>
  );
}
