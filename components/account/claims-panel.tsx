"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Clock3,
  LifeBuoy, Loader2, Plus, X,
} from "lucide-react";

/**
 * The customer's claims: file one, watch it move. Statuses arrive from the
 * API already in plain words (`status_note`); the panel never invents its
 * own copy of what a status means.
 */

type Claim = {
  id: number;
  ref: string | null;
  order_number?: string | null;
  type: string;
  type_label: string;
  description: string;
  quantity?: number | null;
  status: string;
  status_label: string;
  status_note?: string | null;
  outcome_note?: string | null;
  open: boolean;
  filed_at?: string | null;
  resolved_at?: string | null;
};

type Meta = {
  claims_available?: boolean;
  open_count?: number;
  types?: { key: string; label: string }[];
};

const INPUT =
  "h-10 w-full rounded-xl border border-black/[0.10] bg-white px-3 text-[0.88rem] text-[var(--foreground)] placeholder:text-[#9ca3af] focus:border-[var(--primary)] focus:outline-none";
const LABEL = "mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-[var(--muted)]";

const STATUS_BADGE: Record<string, string> = {
  new:               "bg-blue-50 text-blue-700",
  in_review:         "bg-cyan-50 text-cyan-700",
  awaiting_customer: "bg-amber-50 text-amber-700",
  approved:          "bg-emerald-50 text-emerald-700",
  rejected:          "bg-gray-100 text-gray-600",
  closed:            "bg-gray-50 text-gray-500",
};

export default function ClaimsPanel({
  prefillOrder,
  openForm,
}: {
  prefillOrder: string | null;
  openForm: boolean;
}) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(openForm);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [justFiled, setJustFiled] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/account/claims", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      setClaims(Array.isArray(json.data) ? json.data : []);
      setMeta(json.meta ?? null);
    } catch {
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={22} className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (meta?.claims_available === false) {
    return (
      <div className="rounded-[20px] border border-black/[0.06] bg-white p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <LifeBuoy size={28} strokeWidth={1.6} className="mx-auto mb-3 text-[var(--muted)]" />
        <p className="font-bold text-[var(--foreground)]">Claims are not available yet</p>
        <p className="mt-1 text-[0.85rem] text-[var(--muted)]">
          Please contact us directly and we will handle it in person.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {justFiled && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <CheckCircle2 size={20} strokeWidth={1.8} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-[0.9rem] font-bold text-[var(--foreground)]">Claim {justFiled} filed</p>
            <p className="mt-0.5 text-[0.82rem] text-[var(--muted)]">
              Our team has been notified. You will see every status change right here and in your notifications.
            </p>
          </div>
        </div>
      )}

      {/* File a claim */}
      {showForm ? (
        <NewClaimForm
          types={meta?.types ?? []}
          prefillOrder={prefillOrder}
          onClose={() => setShowForm(false)}
          onSaved={(ref) => {
            setShowForm(false);
            setJustFiled(ref);
            void load();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-between rounded-[20px] border border-black/[0.06] bg-white p-5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition hover:border-[var(--primary)]/30"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--primary)]/10">
              <Plus size={18} strokeWidth={2} className="text-[var(--primary)]" />
            </span>
            <span>
              <span className="block font-bold text-[var(--foreground)]">Report a problem</span>
              <span className="block text-[0.82rem] text-[var(--muted)]">
                Damaged, wrong or missing items? File a claim in under a minute.
              </span>
            </span>
          </span>
          <ChevronRight size={16} strokeWidth={2.2} className="text-[var(--muted)]" />
        </button>
      )}

      {/* The list */}
      {claims.length === 0 ? (
        <div className="rounded-[20px] border border-black/[0.06] bg-white p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <LifeBuoy size={28} strokeWidth={1.6} className="mx-auto mb-3 text-[var(--muted)]" />
          <p className="font-bold text-[var(--foreground)]">No claims on your account</p>
          <p className="mt-1 text-[0.85rem] text-[var(--muted)]">
            Hopefully it stays that way. If a delivery ever has a problem, this is where to report it.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <ul className="divide-y divide-black/[0.05]">
            {claims.map((c) => {
              const isOpen = expanded === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[#fafafa] sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[0.78rem] font-semibold text-[var(--muted)]">{c.ref}</span>
                        <span className="text-[0.88rem] font-bold text-[var(--foreground)]">{c.type_label}</span>
                        {c.order_number && (
                          <span className="text-[0.75rem] text-[var(--muted)]">order {c.order_number}</span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[0.82rem] text-[var(--muted)]">{c.description}</p>
                      {c.status_note && (
                        <p className="mt-1 flex items-center gap-1.5 text-[0.78rem] font-medium text-[var(--foreground)]">
                          <Clock3 size={12} strokeWidth={2.2} className="text-[var(--muted)]" />
                          {c.status_note}
                        </p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-bold ${STATUS_BADGE[c.status] ?? "bg-gray-50 text-gray-600"}`}>
                      {c.status_label}
                    </span>
                    {isOpen
                      ? <ChevronDown size={15} strokeWidth={2.2} className="shrink-0 text-[var(--muted)]" />
                      : <ChevronRight size={15} strokeWidth={2.2} className="shrink-0 text-[var(--muted)]" />}
                  </button>

                  {isOpen && (
                    <div className="space-y-3 border-t border-black/[0.04] bg-[#fbfbfc] px-4 py-4 sm:px-5">
                      <div>
                        <p className={LABEL}>What you reported</p>
                        <p className="whitespace-pre-wrap break-words text-[0.85rem] leading-relaxed text-[var(--foreground)]">
                          {c.description}
                        </p>
                        {c.quantity != null && (
                          <p className="mt-1 text-[0.78rem] text-[var(--muted)]">{c.quantity} tyres affected</p>
                        )}
                      </div>
                      {c.outcome_note && (
                        <div>
                          <p className={LABEL}>Outcome</p>
                          <p className="whitespace-pre-wrap text-[0.85rem] leading-relaxed text-[var(--foreground)]">
                            {c.outcome_note}
                          </p>
                        </div>
                      )}
                      <p className="text-[0.75rem] text-[var(--muted)]">
                        Filed {c.filed_at ? new Date(c.filed_at).toLocaleDateString("en-GB") : ""}
                        {c.resolved_at ? ` · decided ${new Date(c.resolved_at).toLocaleDateString("en-GB")}` : ""}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── The form ──────────────────────────────────────────────────────────────────

function NewClaimForm({
  types,
  prefillOrder,
  onClose,
  onSaved,
}: {
  types: { key: string; label: string }[];
  prefillOrder: string | null;
  onClose: () => void;
  onSaved: (ref: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    order_ref: prefillOrder ?? "",
    type: "other",
    quantity: "",
    description: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.description.trim().length < 20) {
      setError("Please describe what happened in a little more detail so our team can act on it.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_ref: form.order_ref.trim() || null,
          type: form.type,
          quantity: form.quantity ? Number(form.quantity) : null,
          description: form.description.trim(),
        }),
      });
      const json = await res.json().catch(() => ({})) as { message?: string; data?: { ref?: string } };
      if (!res.ok) {
        setError(json.message ?? "We could not file the claim. Please try again.");
        return;
      }
      onSaved(json.data?.ref ?? "");
    } catch {
      setError("We could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold text-[var(--foreground)]">Report a problem</p>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#f5f5f5]">
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={LABEL}>Order reference</label>
          <input
            type="text"
            value={form.order_ref}
            onChange={(e) => setForm((f) => ({ ...f, order_ref: e.target.value }))}
            placeholder="Optional, e.g. OK-2026-0455"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>What kind of problem</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className={`${INPUT} cursor-pointer`}
          >
            {types.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Tyres affected</label>
          <input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            placeholder="Optional"
            className={INPUT}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className={LABEL}>What happened</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={4}
          placeholder="Tell us what arrived, what was wrong with it, and anything that helps us check it. Photos can be sent by reply once the claim is filed."
          className="w-full rounded-xl border border-black/[0.10] bg-white px-3 py-2.5 text-[0.88rem] text-[var(--foreground)] placeholder:text-[#9ca3af] focus:border-[var(--primary)] focus:outline-none"
        />
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-[0.82rem] font-medium text-red-600">
          <AlertTriangle size={14} /> {error}
        </p>
      )}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-black/[0.08] px-5 py-2.5 text-[0.88rem] font-semibold text-[var(--foreground)] transition hover:border-black/20"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] px-5 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />} File the claim
        </button>
      </div>
    </form>
  );
}
