"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus, Loader2, X, Trash2, Pencil, AlertTriangle, Link2Off, Scale, CheckCircle2,
} from "lucide-react";
import type { FinanceInvoice, InvoiceReconciliation } from "@/lib/admin-api";
import { formatMoney } from "@/lib/currency";
import { canDo } from "@/lib/admin-permissions";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";

/**
 * What sevDesk raised, typed in by finance, against what this system issued.
 *
 * Deliberately not an integration: an integration that silently stopped syncing
 * would make the two columns agree by accident, which is the one failure this
 * whole board exists to catch. So the second column is somebody's typing, and
 * the disagreement between the two is the product.
 */

const INPUT =
  "h-9 w-full rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#E85C1A] focus:outline-none";
const LABEL = "mb-1 block text-[0.75rem] font-semibold text-[#5c5e62]";

type Tab = "invoices" | "reconciliation";

function Counts({ rec }: { rec: InvoiceReconciliation }) {
  const c = rec.counts;
  const tiles: { label: string; value: number; tone?: "warn" | "bad" }[] = [
    { label: "Our invoices", value: c.website_invoices },
    { label: "Finance invoices", value: c.finance_invoices },
    { label: "Matched", value: c.matched },
    { label: "Only here", value: c.only_here, tone: c.only_here > 0 ? "warn" : undefined },
    { label: "Only in finance", value: c.only_in_finance, tone: c.only_in_finance > 0 ? "warn" : undefined },
    // Two systems holding the same invoice at different money is a worse
    // finding than one holding it alone, and it is invisible from the board.
    { label: "Amount mismatch", value: c.amount_mismatch, tone: c.amount_mismatch > 0 ? "bad" : undefined },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => (
        <div
          key={t.label}
          className={`rounded-xl border p-3 ${
            t.tone === "bad" ? "border-red-200 bg-red-50"
              : t.tone === "warn" ? "border-amber-200 bg-amber-50"
              : "border-black/[0.06] bg-white"
          }`}
        >
          <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#5c5e62]">{t.label}</p>
          <p className={`mt-0.5 text-[1.15rem] font-bold tabular-nums ${
            t.tone === "bad" ? "text-red-700" : t.tone === "warn" ? "text-amber-800" : "text-[#171a20]"
          }`}>
            {t.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function Reconciliation({ from, to, channel }: { from: string; to: string; channel: string }) {
  const [rec, setRec] = useState<InvoiceReconciliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const p = new URLSearchParams();
        if (from) p.set("from", from);
        if (to) p.set("to", to);
        if (channel && channel !== "all") p.set("channel", channel);
        const res = await fetch(`/api/admin/operations/invoice-reconciliation?${p}`);
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.message ?? json?.error ?? "Could not load the reconciliation.");
          setRec(null);
        } else {
          setRec((json?.data ?? null) as InvoiceReconciliation | null);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Could not reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [from, to, channel]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-black/[0.06] bg-white p-8 text-[0.83rem] text-[#5c5e62]">
        <Loader2 size={14} className="animate-spin" /> Comparing the two systems…
      </div>
    );
  }

  if (error || !rec) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[0.83rem] text-amber-900">
        {error ?? "No reconciliation available."}
      </div>
    );
  }

  if (rec.available === false) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[0.83rem] text-amber-900">
        <p className="font-semibold">Finance invoice recording isn&apos;t switched on yet.</p>
        <p className="mt-0.5">{rec.reason ?? "There is nothing to compare against until it is."}</p>
      </div>
    );
  }

  const section = "rounded-2xl border border-black/[0.06] bg-white overflow-hidden";
  const th = "px-3 py-2 text-left text-[0.68rem] font-bold uppercase tracking-wider text-[#5c5e62]";
  const td = "px-3 py-2 text-[0.8rem] text-[#171a20]";

  const mismatched = (rec.matched ?? []).filter((m) => m.amount_matches === false);

  return (
    <div className="space-y-4">
      <Counts rec={rec} />

      {mismatched.length > 0 && (
        <div className={section}>
          <p className="flex items-center gap-1.5 border-b border-black/[0.06] bg-red-50 px-3 py-2 text-[0.8rem] font-bold text-red-800">
            <Scale size={13} /> Same invoice, different money ({mismatched.length})
          </p>
          <table className="w-full">
            <thead><tr className="border-b border-black/[0.06]">
              <th className={th}>Order</th><th className={th}>Ours</th><th className={th}>Finance</th>
              <th className={`${th} text-right`}>Our amount</th><th className={`${th} text-right`}>Finance amount</th>
            </tr></thead>
            <tbody>
              {mismatched.map((m, i) => (
                <tr key={i} className="border-b border-black/[0.04] last:border-0">
                  <td className={`${td} font-mono`}>{m.order_ref ?? "—"}</td>
                  <td className={`${td} font-mono`}>{m.our_invoice ?? "—"}</td>
                  <td className={`${td} font-mono`}>{m.finance_invoice ?? "—"}</td>
                  <td className={`${td} text-right tabular-nums`}>{formatMoney(m.our_amount)}</td>
                  <td className={`${td} text-right font-semibold tabular-nums text-red-700`}>
                    {formatMoney(m.finance_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={section}>
        <p className="border-b border-black/[0.06] bg-[#fafafa] px-3 py-2 text-[0.8rem] font-bold text-[#171a20]">
          Only in this system ({rec.only_here?.length ?? 0})
        </p>
        {(rec.only_here?.length ?? 0) === 0 ? (
          <p className="px-3 py-4 text-[0.8rem] text-[#8c8f94]">Nothing — every invoice we issued has a finance record.</p>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-black/[0.06]">
              <th className={th}>Invoice</th><th className={th}>Order</th><th className={`${th} text-right`}>Amount</th>
            </tr></thead>
            <tbody>
              {rec.only_here!.map((r, i) => (
                <tr key={i} className="border-b border-black/[0.04] last:border-0">
                  <td className={`${td} font-mono`}>{r.invoice_number ?? "—"}</td>
                  <td className={`${td} font-mono`}>{r.order_ref ?? "—"}</td>
                  <td className={`${td} text-right tabular-nums`}>{formatMoney(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={section}>
        <p className="border-b border-black/[0.06] bg-[#fafafa] px-3 py-2 text-[0.8rem] font-bold text-[#171a20]">
          Only in the finance system ({rec.only_in_finance?.length ?? 0})
        </p>
        {(rec.only_in_finance?.length ?? 0) === 0 ? (
          <p className="px-3 py-4 text-[0.8rem] text-[#8c8f94]">Nothing — every finance invoice matches one of ours.</p>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-black/[0.06]">
              <th className={th}>sevDesk number</th><th className={th}>Order</th><th className={`${th} text-right`}>Amount</th>
            </tr></thead>
            <tbody>
              {rec.only_in_finance!.map((r, i) => (
                <tr key={i} className="border-b border-black/[0.04] last:border-0">
                  <td className={`${td} font-mono`}>{r.external_number ?? "—"}</td>
                  <td className={td}>
                    <span className="font-mono">{r.order_ref ?? "—"}</span>
                    {/* An invoice finance cannot match to an order here is
                        exactly the row worth recording, so it is labelled
                        rather than hidden or treated as bad data. */}
                    {r.order_known_here === false && (
                      <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-amber-900">
                        <Link2Off size={9} /> not an order here
                      </span>
                    )}
                  </td>
                  <td className={`${td} text-right tabular-nums`}>{formatMoney(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Entry form ────────────────────────────────────────────────────────────────

const BLANK = {
  external_number: "", issued_on: "", order_ref: "", invoice_number: "",
  amount: "", currency: "EUR", channel: "", notes: "",
};

function InvoiceForm({
  editing, onDone, onCancel,
}: {
  editing: FinanceInvoice | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(() =>
    editing
      ? {
          external_number: editing.external_number ?? "",
          issued_on: editing.issued_on ?? "",
          order_ref: editing.order_ref ?? "",
          invoice_number: editing.invoice_number ?? "",
          amount: editing.amount != null ? String(editing.amount) : "",
          currency: editing.currency ?? "EUR",
          channel: editing.channel ?? "",
          notes: editing.notes ?? "",
        }
      : BLANK,
  );
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof BLANK, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    const body: Record<string, unknown> = {
      external_number: form.external_number.trim(),
      issued_on: form.issued_on,
    };
    if (form.order_ref.trim())      body.order_ref      = form.order_ref.trim();
    if (form.invoice_number.trim()) body.invoice_number = form.invoice_number.trim();
    if (form.amount.trim())         body.amount         = Number(form.amount);
    if (form.currency)              body.currency       = form.currency;
    if (form.channel)               body.channel        = form.channel;
    if (form.notes.trim())          body.notes          = form.notes.trim();

    try {
      const res = await fetch(
        editing ? `/api/admin/finance-invoices/${editing.id}` : "/api/admin/finance-invoices",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // A duplicate external_number comes back as a 422 on that field, not a
        // database error — it is the one entry that would make the two sides of
        // the board agree when they do not, so it lands on the field itself.
        if (res.status === 422 && json.errors) setFieldErrors(json.errors);
        setError(json.message ?? json.error ?? "Could not save this invoice.");
        return;
      }
      onDone();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  const err = (k: string) => fieldErrors[k]?.[0];

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/[0.06] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[0.9rem] font-bold text-[#171a20]">
          {editing ? `Edit ${editing.external_number}` : "Record a finance invoice"}
        </h3>
        <button type="button" onClick={onCancel} className="ml-auto text-[#8c8f94] hover:text-[#171a20]">
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={LABEL}>sevDesk number <span className="text-[#E85C1A]">*</span></label>
          <input value={form.external_number} onChange={(e) => set("external_number", e.target.value)}
                 required placeholder="SD-114" className={INPUT} />
          {err("external_number") && <p className="mt-1 text-[0.72rem] text-red-600">{err("external_number")}</p>}
        </div>
        <div>
          <label className={LABEL}>Issued on <span className="text-[#E85C1A]">*</span></label>
          <input type="date" value={form.issued_on} onChange={(e) => set("issued_on", e.target.value)}
                 required className={INPUT} />
          {err("issued_on") && <p className="mt-1 text-[0.72rem] text-red-600">{err("issued_on")}</p>}
        </div>
        <div>
          <label className={LABEL}>Order ref</label>
          <input value={form.order_ref} onChange={(e) => set("order_ref", e.target.value)}
                 placeholder="OKL-C06OT" className={INPUT} />
          <p className="mt-1 text-[0.68rem] text-[#8c8f94]">Not checked against our orders — record it as it reads.</p>
        </div>
        <div>
          <label className={LABEL}>Our invoice number</label>
          <input value={form.invoice_number} onChange={(e) => set("invoice_number", e.target.value)}
                 placeholder="INV-2026-0042" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Amount</label>
          <input type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)}
                 className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Currency</label>
          <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={INPUT}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Channel</label>
          <select value={form.channel} onChange={(e) => set("channel", e.target.value)} className={INPUT}>
            <option value="">Infer from order ref</option>
            <option value="normal">Normal</option>
            <option value="ebay">eBay</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Notes</label>
          <input value={form.notes} onChange={(e) => set("notes", e.target.value)} className={INPUT} />
        </div>
      </div>

      {error && Object.keys(fieldErrors).length === 0 && (
        <p className="mt-2 text-[0.78rem] text-red-600">{error}</p>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-[0.83rem] font-semibold text-[#5c5e62]">
          Cancel
        </button>
        <button type="submit" disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-[#171a20] px-4 py-2 text-[0.83rem] font-semibold text-white transition hover:bg-black disabled:opacity-50">
          {saving && <Loader2 size={13} className="animate-spin" />}
          {editing ? "Save" : "Record invoice"}
        </button>
      </div>
    </form>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function FinanceInvoicesPanel({
  initialTab, from, to, channel,
}: {
  initialTab: Tab;
  from: string;
  to: string;
  channel: string;
}) {
  const { role, permissions } = useAdminPermissions();
  const canManage = canDo(role ?? "", "finance.manage", permissions);

  const [tab, setTab] = useState<Tab>(initialTab);
  const [rows, setRows] = useState<FinanceInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<FinanceInvoice | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ per_page: "50" });
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      if (channel && channel !== "all") p.set("channel", channel);
      const res = await fetch(`/api/admin/finance-invoices?${p}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUnavailable(json.message ?? json.error ?? "Finance invoices aren't available on this server yet.");
        setRows([]);
      } else {
        setUnavailable(null);
        setRows(Array.isArray(json.data) ? json.data : []);
      }
    } catch {
      setUnavailable("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [from, to, channel]);

  useEffect(() => { void load(); }, [load]);

  async function remove(id: number) {
    setDeleting(id);
    try {
      await fetch(`/api/admin/finance-invoices/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setDeleting(null);
    }
  }

  const tabBtn = (t: Tab) =>
    `rounded-full px-3.5 py-1.5 text-[0.8rem] font-semibold transition ${
      tab === t ? "bg-[#171a20] text-white" : "bg-[#f0f2f5] text-[#5c5e62] hover:bg-[#e5e7eb]"
    }`;

  const th = "px-3 py-2 text-left text-[0.68rem] font-bold uppercase tracking-wider text-[#5c5e62]";
  const td = "px-3 py-2 text-[0.8rem] text-[#171a20]";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setTab("invoices")} className={tabBtn("invoices")}>
          Recorded invoices
        </button>
        <button type="button" onClick={() => setTab("reconciliation")} className={tabBtn("reconciliation")}>
          Reconciliation
        </button>
        {tab === "invoices" && canManage && !adding && !editing && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-[#E85C1A] px-3.5 py-1.5 text-[0.8rem] font-semibold text-white transition hover:bg-[#d24f13]"
          >
            <Plus size={13} /> Record an invoice
          </button>
        )}
      </div>

      {tab === "reconciliation" ? (
        <Reconciliation from={from} to={to} channel={channel} />
      ) : (
        <>
          {(adding || editing) && (
            <InvoiceForm
              editing={editing}
              onCancel={() => { setAdding(false); setEditing(null); }}
              onDone={() => { setAdding(false); setEditing(null); void load(); }}
            />
          )}

          {unavailable ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[0.83rem] text-amber-900">
              <p className="font-semibold">Not available on this server yet.</p>
              <p className="mt-0.5">{unavailable}</p>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-black/[0.06] bg-white p-8 text-[0.83rem] text-[#5c5e62]">
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center text-[0.83rem] text-[#8c8f94]">
              Nothing recorded for this period yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                      <th className={th}>sevDesk number</th>
                      <th className={th}>Issued</th>
                      <th className={th}>Order</th>
                      <th className={th}>Our invoice</th>
                      <th className={`${th} text-right`}>Amount</th>
                      <th className={th}>Channel</th>
                      <th className={th} />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b border-black/[0.04] last:border-0">
                        <td className={`${td} font-mono font-semibold`}>{r.external_number}</td>
                        <td className={td}>{r.issued_on}</td>
                        <td className={td}>
                          <span className="font-mono">{r.order_ref ?? "—"}</span>
                          {r.order_known_here === false && r.order_ref && (
                            <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-amber-900">
                              <Link2Off size={9} /> not an order here
                            </span>
                          )}
                          {r.matched === true && (
                            <span className="ml-1.5 inline-flex items-center gap-1 text-[0.65rem] font-bold text-emerald-700">
                              <CheckCircle2 size={9} /> matched
                            </span>
                          )}
                        </td>
                        <td className={`${td} font-mono`}>{r.invoice_number ?? "—"}</td>
                        <td className={`${td} text-right tabular-nums`}>{formatMoney(r.amount, r.currency)}</td>
                        <td className={`${td} capitalize`}>{r.channel ?? "—"}</td>
                        <td className={`${td} text-right`}>
                          {canManage && (
                            <div className="flex justify-end gap-0.5">
                              <button type="button" onClick={() => { setEditing(r); setAdding(false); }}
                                      title="Edit"
                                      className="rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-[#f0f2f5] hover:text-[#171a20]">
                                <Pencil size={13} />
                              </button>
                              <button type="button" onClick={() => remove(r.id)} disabled={deleting === r.id}
                                      title="Delete"
                                      className="rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                                {deleting === r.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <p className="flex items-start gap-1.5 text-[0.72rem] leading-snug text-[#8c8f94]">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            This is typed in from sevDesk on purpose rather than synced. An integration that
            quietly stopped working would make both columns agree, which is the one failure the
            board exists to catch.
          </p>
        </>
      )}
    </div>
  );
}
