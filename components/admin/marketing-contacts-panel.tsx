"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, Search, Trash2, Users, CheckCircle2, XCircle, Plus, Pencil,
  HelpCircle, AlertTriangle, RefreshCw, FileText, X, ChevronLeft, ChevronRight,
  ArrowRightLeft, Info,
} from "lucide-react";
import type {
  MarketingContact, MarketingContactStats, MarketingContactImportResult,
  MarketingContactMoveResult, MarketingContactMoveSelector, MarketingContactExistsError,
} from "@/lib/admin-api";
import { MarketSelect, useMarketOptions, type MarketOption } from "./market-select";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  subscribed:   "Subscribed",
  unsubscribed: "Unsubscribed",
  unknown:      "Unknown",
};

const STATUS_BADGE: Record<string, string> = {
  subscribed:   "bg-emerald-100 text-emerald-700",
  unsubscribed: "bg-gray-100 text-gray-500",
  unknown:      "bg-amber-100 text-amber-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.72rem] font-semibold ${STATUS_BADGE[status] ?? "bg-gray-100 text-gray-500"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// ── Stats cards ───────────────────────────────────────────────────────────────

function StatsCards({ stats, loading }: { stats: MarketingContactStats | null; loading: boolean }) {
  const cards = [
    { label: "Total", value: stats?.total ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Subscribed", value: stats?.subscribed ?? 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Unknown", value: stats?.unknown ?? 0, icon: HelpCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Unsubscribed", value: stats?.unsubscribed ?? 0, icon: XCircle, color: "text-gray-500", bg: "bg-gray-100" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="rounded-xl border border-black/[0.07] bg-white p-4">
          <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
            <Icon size={16} className={color} />
          </div>
          <p className="text-[1.4rem] font-extrabold text-[#171a20]">
            {loading ? "—" : value.toLocaleString()}
          </p>
          <p className="text-[0.75rem] text-[#5c5e62]">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Moving contacts between markets ───────────────────────────────────────────

/**
 * A contact belongs to exactly one market, so adding an existing address under
 * a second market was never going to work through the add form — it's a move.
 * Single shared call for every entry point (add-form conflict, row action, bulk
 * selection, whole-market move); the backend ORs the selectors it's given.
 */
async function moveMarket(
  selector: MarketingContactMoveSelector,
  toMarket: string,
): Promise<{ ok: true; result: MarketingContactMoveResult } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/admin/marketing-contacts/move-market", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...selector, to_market: toMarket }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json.error ?? json.message ?? `Could not move contacts (${res.status}).` };
    }
    return { ok: true, result: json.data ?? json };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

type MoveRequest = {
  title: string;
  description: string;
  selector: MarketingContactMoveSelector;
  /** Hidden from the picker — moving somewhere they already are is a no-op. */
  excludeMarket?: string;
  /** Cleanup owned by the caller (clearing a selection, resetting a filter). */
  onDone?: (result: MarketingContactMoveResult) => void;
};

function MoveMarketModal({
  request,
  markets,
  onClose,
  onMoved,
}: {
  request: MoveRequest;
  markets: MarketOption[];
  onClose: () => void;
  onMoved: () => void;
}) {
  const [market, setMarket]   = useState("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<MarketingContactMoveResult | null>(null);

  // "Germany" won't be in /markets until a contact is already in it, so the
  // picker keeps its free-text "+ New market" path — a list limited to existing
  // options could never create the first one.
  const options = request.excludeMarket
    ? markets.filter((m) => m.market !== request.excludeMarket)
    : markets;

  async function handleMove() {
    if (!market.trim()) {
      setError("Choose (or type) a destination market.");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await moveMarket(request.selector, market.trim());
    setSaving(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(res.result);
    request.onDone?.(res.result);
    onMoved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
          <h2 className="font-bold text-[#171a20]">{request.title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#5c5e62] hover:bg-[#f0f2f5]">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {result ? (
            <div className="space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[0.83rem]">
              <p className="font-bold text-emerald-800">
                Moved to <span className="capitalize">{result.to_market}</span>
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-emerald-700">
                <span>Moved</span><span className="font-semibold">{result.moved.toLocaleString()}</span>
                <span>Already there</span><span className="font-semibold">{result.already_in_place.toLocaleString()}</span>
              </div>
              {result.not_found.length > 0 && (
                <div className="mt-2 rounded-lg bg-amber-50 p-2 text-amber-700">
                  <p className="font-semibold">Not on the list ({result.not_found.length})</p>
                  <p className="mt-0.5 text-[0.78rem]">
                    Nothing was created for these — a move never imports a new address.
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {result.not_found.slice(0, 5).map((e) => <li key={e}>{e}</li>)}
                    {result.not_found.length > 5 && <li>…and {result.not_found.length - 5} more</li>}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-[0.83rem] text-[#5c5e62]">{request.description}</p>
              <div>
                <label className="mb-1 block text-[0.78rem] font-semibold text-[#5c5e62]">Move to market *</label>
                <MarketSelect markets={options} value={market} onChange={setMarket} mode="create" />
              </div>
              <p className="flex items-start gap-1.5 text-[0.72rem] text-[#5c5e62]">
                <Info size={12} className="mt-0.5 shrink-0" />
                Nothing is created or deleted, and unsubscribed contacts keep their status.
              </p>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-[0.83rem] text-red-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-[0.83rem] font-semibold text-[#5c5e62] hover:bg-[#f0f2f5]"
          >
            {result ? "Done" : "Cancel"}
          </button>
          {!result && (
            <button
              type="button"
              onClick={handleMove}
              disabled={saving || !market.trim()}
              className="flex items-center gap-1.5 rounded-full bg-[#f4511e] px-4 py-2 text-[0.83rem] font-semibold text-white transition hover:bg-[#df4618] disabled:opacity-60"
            >
              {saving ? <RefreshCw size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />}
              {saving ? "Moving…" : "Move"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Import card ───────────────────────────────────────────────────────────────

function ImportCard({
  markets,
  onImported,
}: {
  markets: MarketOption[];
  onImported: () => void;
}) {
  const inputRef      = useRef<HTMLInputElement>(null);
  const [file, setFile]             = useState<File | null>(null);
  const [market, setMarket]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<MarketingContactImportResult | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [dragging, setDragging]     = useState(false);

  function pickFile(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "txt") {
      setError("Please upload a CSV or TXT file.");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  }

  async function handleUpload() {
    if (!file) return;
    if (!market.trim()) {
      setError("Select (or create) a market before importing.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("market", market.trim());

    try {
      const res = await fetch("/api/admin/marketing-contacts", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? json.message ?? `Upload failed (${res.status}).`);
      } else {
        setResult(json as MarketingContactImportResult);
        setFile(null);
        onImported();
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-black/[0.07] bg-white p-5">
      <h2 className="mb-3 text-[0.875rem] font-bold text-[#171a20]">Import Contacts</h2>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) pickFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={[
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition",
          dragging ? "border-[#f4511e] bg-orange-50" : "border-black/10 bg-[#f5f5f5] hover:border-[#f4511e]/50 hover:bg-orange-50/30",
        ].join(" ")}
      >
        <Upload size={24} className="text-[#5c5e62]" />
        <p className="text-[0.83rem] font-medium text-[#171a20]">
          {file ? file.name : "Drop CSV / TXT file here or click to browse"}
        </p>
        <p className="text-[0.72rem] text-[#5c5e62]">Wix export format · max 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
        />
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-[0.78rem] font-semibold text-[#5c5e62]">
          Market — every imported contact is tagged with this
        </label>
        <MarketSelect markets={markets} value={market} onChange={setMarket} mode="create" />
        {/* An import is also a move: a contact has exactly one market, so an
            address already on the list is reassigned to this one rather than
            duplicated. Easy to do by accident with an overlapping list. */}
        <p className="mt-1.5 flex items-start gap-1.5 text-[0.72rem] text-[#5c5e62]">
          <Info size={12} className="mt-0.5 shrink-0" />
          Contacts already on the list are <strong className="font-semibold">moved</strong> into this
          market — their current market is overwritten. Nothing is duplicated.
        </p>
      </div>

      {file && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[0.83rem] text-[#171a20]">
            <FileText size={14} className="text-[#5c5e62]" />
            <span className="truncate">{file.name}</span>
            <span className="text-[#5c5e62]">({(file.size / 1024).toFixed(0)} KB)</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="rounded-lg p-1 text-[#5c5e62] hover:bg-[#f0f2f5] hover:text-[#171a20]"
            >
              <X size={14} />
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || !market.trim()}
              className="flex items-center gap-1.5 rounded-full bg-[#f4511e] px-4 py-1.5 text-[0.78rem] font-semibold text-white transition hover:bg-[#df4618] disabled:opacity-60"
            >
              {loading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
              {loading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-[0.83rem] text-red-700">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="mt-3 space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[0.83rem]">
          <p className="font-bold text-emerald-800">Import complete</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-emerald-700">
            <span>Imported</span><span className="font-semibold">{result.imported.toLocaleString()}</span>
            <span>Updated</span><span className="font-semibold">{result.updated.toLocaleString()}</span>
            <span>Skipped (no email)</span><span className="font-semibold">{result.skipped_no_email.toLocaleString()}</span>
            <span>Subscribed</span><span className="font-semibold">{result.subscribed.toLocaleString()}</span>
            <span>Unsubscribed</span><span className="font-semibold">{result.unsubscribed.toLocaleString()}</span>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2 rounded-lg bg-amber-50 p-2 text-amber-700">
              <p className="font-semibold">Warnings ({result.errors.length})</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                {result.errors.length > 5 && <li>…and {result.errors.length - 5} more</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add / edit contact modal ──────────────────────────────────────────────────

type ContactFormValues = {
  email: string;
  market: string;
  first_name: string;
  last_name: string;
  company: string;
  country: string;
  phone: string;
};

function ContactModal({
  contact,
  markets,
  onClose,
  onSaved,
}: {
  /** undefined = create; provided = edit */
  contact?: MarketingContact;
  markets: MarketOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!contact;
  const [values, setValues] = useState<ContactFormValues>({
    email: contact?.email ?? "",
    market: contact?.market ?? "",
    first_name: contact?.first_name ?? "",
    last_name: contact?.last_name ?? "",
    company: contact?.company ?? "",
    country: contact?.country ?? "",
    phone: contact?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set when the backend answers 422 `contact_exists` with can_move — the
  // address is already on the list under another market, so the fix is a move,
  // not an add. A bare "email already taken" field error would leave the
  // marketer having to delete the contact first, which is what they reported.
  const [conflict, setConflict] = useState<MarketingContactExistsError["data"] | null>(null);
  const [moving, setMoving] = useState(false);

  function set<K extends keyof ContactFormValues>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setConflict(null);
  }

  function isExistsError(json: unknown): json is MarketingContactExistsError {
    return (
      typeof json === "object" && json !== null &&
      (json as { code?: unknown }).code === "contact_exists" &&
      typeof (json as { data?: unknown }).data === "object" &&
      (json as { data: unknown }).data !== null
    );
  }

  async function handleConfirmMove() {
    if (!conflict) return;
    setMoving(true);
    setError(null);

    const res = await moveMarket(
      { contact_ids: [conflict.existing_contact.id] },
      conflict.target_market,
    );
    setMoving(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSaved();
    onClose();
  }

  async function handleSave() {
    if (!values.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!values.market.trim()) {
      setError("Market is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setConflict(null);

    const body: Record<string, string> = { email: values.email.trim(), market: values.market.trim() };
    if (values.first_name) body.first_name = values.first_name;
    if (values.last_name) body.last_name = values.last_name;
    if (values.company) body.company = values.company;
    if (values.country) body.country = values.country;
    if (values.phone) body.phone = values.phone;

    try {
      const url = isEdit ? `/api/admin/marketing-contacts/${contact!.id}` : "/api/admin/marketing-contacts";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // can_move === false means it's already in the market that was asked
        // for — there is no move to offer, so the plain field error is right.
        if (isExistsError(json) && json.data.can_move) {
          setConflict(json.data);
          return;
        }
        setError(json.error ?? json.message ?? `Could not save (${res.status}).`);
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#f4511e] focus:outline-none";
  const labelClass = "mb-1 block text-[0.78rem] font-semibold text-[#5c5e62]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
          <h2 className="font-bold text-[#171a20]">{isEdit ? "Edit contact" : "Add contact"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#5c5e62] hover:bg-[#f0f2f5]">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Market *</label>
            <MarketSelect markets={markets} value={values.market} onChange={(m) => set("market", m)} mode="create" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First name</label>
              <input value={values.first_name} onChange={(e) => set("first_name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input value={values.last_name} onChange={(e) => set("last_name", e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Company</label>
            <input value={values.company} onChange={(e) => set("company", e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Country</label>
              <input value={values.country} onChange={(e) => set("country", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input value={values.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
            </div>
          </div>

          {conflict && (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[0.83rem] text-amber-800">
              <p className="flex items-start gap-2">
                <ArrowRightLeft size={14} className="mt-0.5 shrink-0" />
                <span>
                  <strong className="font-semibold">{conflict.existing_contact.email}</strong> is
                  already in <span className="capitalize">{conflict.existing_contact.market ?? "—"}</span>.
                  Move it to <span className="capitalize">{conflict.target_market}</span>?
                </span>
              </p>
              <p className="text-[0.75rem]">
                A contact belongs to one market at a time, so this reassigns it — no duplicate is
                created and its subscription status is untouched.
              </p>
              <button
                type="button"
                onClick={handleConfirmMove}
                disabled={moving}
                className="flex items-center gap-1.5 rounded-full bg-amber-600 px-3.5 py-1.5 text-[0.78rem] font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
              >
                {moving ? <RefreshCw size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />}
                {moving ? "Moving…" : <span>Move to <span className="capitalize">{conflict.target_market}</span></span>}
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-[0.83rem] text-red-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-[0.83rem] font-semibold text-[#5c5e62] hover:bg-[#f0f2f5]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || moving}
            className="flex items-center gap-1.5 rounded-full bg-[#f4511e] px-4 py-2 text-[0.83rem] font-semibold text-white transition hover:bg-[#df4618] disabled:opacity-60"
          >
            {saving ? <RefreshCw size={12} className="animate-spin" /> : null}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Contacts table ────────────────────────────────────────────────────────────

type Filters = {
  status: string;
  company: string;
  country: string;
  market: string;
  search: string;
};

export default function MarketingContactsPanel() {
  const [stats, setStats]         = useState<MarketingContactStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [contacts, setContacts]   = useState<MarketingContact[]>([]);
  const [meta, setMeta]           = useState({ total: 0, current_page: 1, last_page: 1 });
  const [tableLoading, setTableLoading] = useState(true);

  const [filters, setFilters]     = useState<Filters>({ status: "", company: "", country: "", market: "", search: "" });
  const [page, setPage]           = useState(1);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { markets, refresh: refreshMarkets } = useMarketOptions();
  const [modalContact, setModalContact] = useState<MarketingContact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selected, setSelected] = useState<number[]>([]);
  const [moveRequest, setMoveRequest] = useState<MoveRequest | null>(null);

  // ── Data fetchers ────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/marketing-contacts/stats");
      const json = await res.json().catch(() => null);
      if (json) setStats(json);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchContacts = useCallback(async (f: Filters, p: number) => {
    setTableLoading(true);
    const qs = new URLSearchParams({ page: String(p), per_page: "25" });
    if (f.status)  qs.set("status",  f.status);
    if (f.company) qs.set("company", f.company);
    if (f.country) qs.set("country", f.country);
    if (f.market)  qs.set("market",  f.market);
    if (f.search)  qs.set("search",  f.search);

    try {
      const res = await fetch(`/api/admin/marketing-contacts?${qs.toString()}`);
      const json = await res.json().catch(() => ({ data: [], meta: {} }));
      setContacts(json.data ?? []);
      setMeta({
        total: json.meta?.total ?? 0,
        current_page: json.meta?.current_page ?? 1,
        last_page: json.meta?.last_page ?? 1,
      });
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchContacts(filters, page); }, [fetchContacts, filters, page]);

  /**
   * Counts change on every move and an emptied market vanishes from /markets
   * entirely (that list is derived from live data), so all three always refresh
   * together rather than leaving a stale tab pointing at nothing.
   */
  const refreshAll = useCallback(() => {
    fetchStats();
    fetchContacts(filters, page);
    refreshMarkets();
  }, [fetchStats, fetchContacts, refreshMarkets, filters, page]);

  function applyFilter(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    setSelected([]);
  }

  const pageIds = contacts.map((c) => c.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  function toggleOne(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAllOnPage() {
    setSelected((prev) =>
      allOnPageSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])],
    );
  }

  function requestBulkMove() {
    setMoveRequest({
      title: `Move ${selected.length} contact${selected.length === 1 ? "" : "s"}`,
      description:
        `${selected.length} selected contact${selected.length === 1 ? "" : "s"} will be reassigned to the market you choose.`,
      selector: { contact_ids: selected },
      onDone: () => setSelected([]),
    });
  }

  function requestRowMove(c: MarketingContact) {
    setMoveRequest({
      title: "Move to market",
      description: `${c.email} is currently in "${c.market ?? "no market"}". Choose where it should go instead.`,
      selector: { contact_ids: [c.id] },
      excludeMarket: c.market ?? undefined,
    });
  }

  function requestMarketMove(m: MarketOption) {
    setMoveRequest({
      title: `Empty the "${m.market}" market`,
      description:
        `All ${m.contact_count.toLocaleString()} contact${m.contact_count === 1 ? "" : "s"} in "${m.market}" ` +
        `will be moved to the market you choose. "${m.market}" then disappears on its own — markets are ` +
        `derived from live contact data, so an empty one stops existing. Pick a new name to rename it instead.`,
      selector: { from_market: m.market },
      excludeMarket: m.market,
      // The active tab is about to point at a market that no longer exists.
      onDone: () => {
        setSelected([]);
        if (filters.market === m.market) applyFilter("market", "");
      },
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this contact from the marketing list?")) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/marketing-contacts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setDeleteError(json.error ?? json.message ?? "Could not remove contact.");
      } else {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        fetchStats();
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">

      {/* Stats */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* Import */}
      <ImportCard markets={markets} onImported={refreshAll} />

      {/* Market tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => applyFilter("market", "")}
          className={[
            "rounded-full px-3 py-1.5 text-[0.78rem] font-semibold transition",
            filters.market === "" ? "bg-[#171a20] text-white" : "bg-[#f0f2f5] text-[#5c5e62] hover:bg-[#e5e7eb]",
          ].join(" ")}
        >
          All markets
        </button>
        {markets.map((m) => {
          const active = filters.market === m.market;
          return (
            <div
              key={m.market}
              className={[
                "flex items-center rounded-full transition",
                active ? "bg-[#171a20] text-white" : "bg-[#f0f2f5] text-[#5c5e62] hover:bg-[#e5e7eb]",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => applyFilter("market", m.market)}
                className={`rounded-full py-1.5 pl-3 text-[0.78rem] font-semibold capitalize ${active ? "pr-1.5" : "pr-3"}`}
              >
                {m.market} ({m.contact_count})
              </button>
              {/* Only on the market you're looking at — an "empty this market"
                  control on all of them at once invites the wrong click. */}
              {active && (
                <button
                  type="button"
                  onClick={() => requestMarketMove(m)}
                  title={`Move all contacts out of "${m.market}"`}
                  className="mr-1 rounded-full p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
                >
                  <ArrowRightLeft size={12} />
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-[#f4511e] px-4 py-1.5 text-[0.78rem] font-semibold text-white transition hover:bg-[#df4618]"
        >
          <Plus size={14} /> Add contact
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5e62]" />
          <input
            type="text"
            placeholder="Search name, email, company…"
            value={filters.search}
            onChange={(e) => applyFilter("search", e.target.value)}
            className="h-9 w-full rounded-lg border border-black/[0.10] bg-white pl-8 pr-3 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#f4511e] focus:outline-none"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => applyFilter("status", e.target.value)}
          className="h-9 rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] focus:border-[#f4511e] focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="subscribed">Subscribed</option>
          <option value="unknown">Unknown</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <input
          type="text"
          placeholder="Company"
          value={filters.company}
          onChange={(e) => applyFilter("company", e.target.value)}
          className="h-9 w-36 rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#f4511e] focus:outline-none"
        />
        <input
          type="text"
          placeholder="Country (DE, FR…)"
          value={filters.country}
          onChange={(e) => applyFilter("country", e.target.value)}
          className="h-9 w-36 rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#f4511e] focus:outline-none"
        />
        {(filters.status || filters.company || filters.country || filters.market || filters.search) && (
          <button
            type="button"
            onClick={() => { setFilters({ status: "", company: "", country: "", market: "", search: "" }); setPage(1); }}
            className="flex items-center gap-1 text-[0.78rem] text-[#5c5e62] hover:text-[#171a20]"
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="ml-auto text-[0.78rem] text-[#5c5e62]">
          {meta.total.toLocaleString()} contacts
        </span>
      </div>

      {deleteError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-[0.83rem] text-red-700">
          <AlertTriangle size={14} className="shrink-0" /> {deleteError}
        </div>
      )}

      {/* Bulk action bar — appears only with a live selection */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#f4511e]/25 bg-orange-50 px-4 py-2.5">
          <span className="text-[0.83rem] font-semibold text-[#171a20]">
            {selected.length.toLocaleString()} selected
          </span>
          <button
            type="button"
            onClick={requestBulkMove}
            className="flex items-center gap-1.5 rounded-full bg-[#f4511e] px-3.5 py-1.5 text-[0.78rem] font-semibold text-white transition hover:bg-[#df4618]"
          >
            <ArrowRightLeft size={12} /> Move to market…
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="ml-auto flex items-center gap-1 text-[0.78rem] text-[#5c5e62] hover:text-[#171a20]"
          >
            <X size={12} /> Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#f5f5f5]">
                <th className="w-10 px-4 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAllOnPage}
                    disabled={pageIds.length === 0}
                    aria-label="Select all contacts on this page"
                    className="h-3.5 w-3.5 cursor-pointer accent-[#f4511e]"
                  />
                </th>
                {["Name", "Email", "Company", "Country", "Market", "Source", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[0.72rem] font-semibold uppercase tracking-wide text-[#5c5e62]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {tableLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[0.83rem] text-[#5c5e62]">
                    <RefreshCw size={16} className="mx-auto mb-2 animate-spin text-[#5c5e62]" />
                    Loading contacts…
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[0.83rem] text-[#5c5e62]">
                    <Users size={24} className="mx-auto mb-2 text-[#8c8f94]" />
                    No contacts found. Import a CSV to get started.
                  </td>
                </tr>
              ) : contacts.map((c) => {
                const dim = c.status === "unsubscribed";
                const checked = selected.includes(c.id);
                return (
                  <tr
                    key={c.id}
                    className={[
                      "group transition-colors",
                      checked ? "bg-orange-50/60" : dim ? "opacity-50" : "hover:bg-[#f5f5f5]/60",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(c.id)}
                        aria-label={`Select ${c.email}`}
                        className="h-3.5 w-3.5 cursor-pointer accent-[#f4511e]"
                      />
                    </td>
                    <td className="px-4 py-3 text-[0.83rem] text-[#171a20]">
                      {[c.first_name, c.last_name].filter(Boolean).join(" ") || <span className="text-[#8c8f94]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[0.83rem] text-[#171a20]">{c.email}</td>
                    <td className="px-4 py-3 text-[0.83rem] text-[#5c5e62]">{c.company ?? "—"}</td>
                    <td className="px-4 py-3 text-[0.83rem] text-[#5c5e62]">{c.country ?? "—"}</td>
                    <td className="px-4 py-3 text-[0.83rem] capitalize text-[#5c5e62]">{c.market ?? "—"}</td>
                    <td className="px-4 py-3 text-[0.83rem] text-[#5c5e62]">{c.source ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => requestRowMove(c)}
                        title="Move to market…"
                        className="invisible mr-1 rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-[#f0f2f5] hover:text-[#171a20] group-hover:visible"
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalContact(c)}
                        title="Edit contact"
                        className="invisible mr-1 rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-[#f0f2f5] hover:text-[#171a20] group-hover:visible"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        title="Remove contact"
                        className="invisible rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-red-50 hover:text-red-600 group-hover:visible disabled:opacity-60"
                      >
                        {deletingId === c.id
                          ? <RefreshCw size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-black/[0.06] px-4 py-3">
            <span className="text-[0.78rem] text-[#5c5e62]">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5c5e62] transition hover:bg-[#f0f2f5] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5c5e62] transition hover:bg-[#f0f2f5] disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <ContactModal
          markets={markets}
          onClose={() => setShowAddModal(false)}
          onSaved={refreshAll}
        />
      )}
      {modalContact && (
        <ContactModal
          contact={modalContact}
          markets={markets}
          onClose={() => setModalContact(null)}
          onSaved={refreshAll}
        />
      )}
      {moveRequest && (
        <MoveMarketModal
          request={moveRequest}
          markets={markets}
          onClose={() => setMoveRequest(null)}
          onMoved={refreshAll}
        />
      )}
    </div>
  );
}
