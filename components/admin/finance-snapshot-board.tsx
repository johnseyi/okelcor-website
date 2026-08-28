"use client";

/**
 * The finance snapshot board — the panel version of finance's D13.html.
 *
 * Same two halves he designed: the six-category pipeline grouped per staff
 * member (click a person to drill into their records), and the "Finance
 * Liquidity Working" table whose derived rows (cash position, liquidity
 * injection request, forecasted cash position) are computed here, never
 * stored. Data lives in the API now, shared across everyone with finance
 * access, instead of one browser's localStorage.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  AlertCircle, Download, FileUp, LineChart, Loader2, Pencil, Plus, Printer,
  RefreshCw, Trash2, Upload, X,
} from "lucide-react";
import {
  getSnapshot, createItem, updateItem, deleteItem, bulkAddItems,
  createLiquidityEntry, updateLiquidityEntry, deleteLiquidityEntry, restoreBackup,
  type SnapshotItem, type LiquidityEntry, type SnapshotMeta, type ItemInput,
} from "@/app/admin/finance-snapshot/actions";
import LiquidityLadder from "@/components/admin/liquidity-ladder";

// ── Formatting ────────────────────────────────────────────────────────────────

function fmt(num: number): string {
  if (!num || isNaN(num)) return "—";
  const s = Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return num < 0 ? `- ${s}` : s;
}

const inputCls =
  "h-9 w-full rounded-xl border border-black/[0.09] bg-white px-3 text-[0.83rem] text-[#1a1a1a] outline-none placeholder:text-[#aaa] transition focus:border-[#E85C1A] focus:ring-2 focus:ring-[#E85C1A]/10";

const STATUS_COLORS: Record<string, string> = {
  Pending:        "bg-amber-100 text-amber-700",
  Sent:           "bg-blue-100 text-blue-700",
  "In Progress":  "bg-cyan-100 text-cyan-700",
  "Under Review": "bg-violet-100 text-violet-700",
  Approved:       "bg-emerald-100 text-emerald-700",
  Completed:      "bg-emerald-100 text-emerald-800",
  Cancelled:      "bg-gray-100 text-gray-500",
};

// ── CSV parsing (same tolerant header matching as the original board) ─────────

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === "," && !inQuotes) { out.push(cur.trim().replace(/^"|"$/g, "")); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim().replace(/^"|"$/g, ""));
  return out;
}

function parseCSV(text: string, categories: string[]): ItemInput[] {
  const lines = text.split(/\r\n|\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const idx = (...needles: string[]) => headers.findIndex((h) => needles.some((n) => h.includes(n)));

  const catIdx = idx("category"), personIdx = idx("person", "staff", "owner"), refIdx = idx("ref");
  const dateIdx = idx("date"), clientIdx = idx("client", "customer", "address");
  const statusIdx = idx("status"), commentIdx = idx("comment", "notes", "remark");
  const amountIdx = idx("amount", "total", "price");

  const items: ItemInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length === 0) continue;
    const rawCat = catIdx !== -1 ? row[catIdx] : "";
    const category = categories.find((c) => c.toLowerCase() === rawCat.toLowerCase()) ?? categories[0];
    const amount = amountIdx !== -1 ? parseFloat(row[amountIdx].replace(/[^0-9.-]+/g, "")) : 0;
    items.push({
      category,
      person:  (personIdx !== -1 && row[personIdx]) || "Unassigned",
      ref:     (refIdx !== -1 && row[refIdx]) || `REF-${i}`,
      date:    (dateIdx !== -1 && row[dateIdx]) || null,
      client:  (clientIdx !== -1 && row[clientIdx]) || null,
      status:  (statusIdx !== -1 && row[statusIdx]) || "Pending",
      comment: (commentIdx !== -1 && row[commentIdx]) || null,
      amount:  isNaN(amount) ? 0 : amount,
    });
  }
  return items;
}

// ── Component ─────────────────────────────────────────────────────────────────

type ItemModalState = { mode: "create" | "edit"; item?: SnapshotItem; presetCategory?: string; presetPerson?: string } | null;
type DrillState = { category: string; person: string } | null;
type LiqModalState = { line: string; label: string; period: "open_current" | "next_month" } | null;

export default function FinanceSnapshotBoard() {
  const [items, setItems]         = useState<SnapshotItem[]>([]);
  const [liquidity, setLiquidity] = useState<LiquidityEntry[]>([]);
  const [meta, setMeta]           = useState<SnapshotMeta | null>(null);
  const [loading, setLoading]     = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [notice, setNotice]       = useState<string | null>(null);
  const [, startTransition]       = useTransition();

  const [drill, setDrill]           = useState<DrillState>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const deepLinkDone = useRef(false);
  const [itemModal, setItemModal]   = useState<ItemModalState>(null);
  const [liqModal, setLiqModal]     = useState<LiqModalState>(null);
  const [saving, setSaving]         = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef  = useRef<HTMLInputElement>(null);

  // Form state for the item modal
  const [fCategory, setFCategory] = useState("");
  const [fPerson, setFPerson]     = useState("");
  const [fAssignee, setFAssignee] = useState<string>("");   // admin user id as string, "" = untagged
  const [fRef, setFRef]           = useState("");
  const [fDate, setFDate]         = useState("");
  const [fClient, setFClient]     = useState("");
  const [fStatus, setFStatus]     = useState("Pending");
  const [fComment, setFComment]   = useState("");
  const [fAmount, setFAmount]     = useState("");

  // Form state for adding a liquidity line
  const [lDesc, setLDesc] = useState("");
  const [lRef, setLRef]   = useState("");
  const [lAmount, setLAmount] = useState("");

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getSnapshot();
      if (res.error || !res.data) { setPageError(res.error ?? "Failed to load."); setLoading(false); return; }
      setItems(res.data.items);
      setLiquidity(res.data.liquidity);
      setMeta(res.data.meta);
      setPageError(null);
      setLoading(false);

      // ?item=<id> — a My Work "Open" or a notification lands on the exact
      // record, not the whole page: open its person's drill-down and
      // highlight the row. Once, on the first successful load.
      if (!deepLinkDone.current) {
        deepLinkDone.current = true;
        const raw = new URLSearchParams(window.location.search).get("item");
        const id = raw ? Number(raw) : NaN;
        if (Number.isFinite(id)) {
          const target = res.data.items.find((i) => i.id === id);
          if (target) {
            setHighlightId(id);
            setDrill({ category: target.category, person: target.person });
          } else {
            setNotice("That task is no longer on the board — it may have been deleted.");
          }
        }
      }
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived: liquidity math (same formulas as the original) ────────────────

  const liq = useMemo(() => {
    const lines = meta?.liquidity_lines ?? [];
    const sum = (line: string, period?: string) =>
      liquidity.filter((e) => e.line === line && (!period || e.period === period))
        .reduce((s, e) => s + e.amount, 0);

    const rows = lines.map((l) => ({
      key: l.key, label: l.label,
      open: sum(l.key, "open_current"), next: sum(l.key, "next_month"), total: sum(l.key),
    }));

    const outflowKeys = lines.map((l) => l.key).filter((k) => k !== "bank_balance" && k !== "revenue_payment");
    const outOpen  = outflowKeys.reduce((s, k) => s + sum(k, "open_current"), 0);
    const outNext  = outflowKeys.reduce((s, k) => s + sum(k, "next_month"), 0);
    const bankOpen = sum("bank_balance", "open_current");
    const bankNext = sum("bank_balance", "next_month");
    const revOpen  = sum("revenue_payment", "open_current");
    const revNext  = sum("revenue_payment", "next_month");

    const cashOpen = bankOpen + outOpen, cashNext = bankNext + outNext;
    const foreOpen = cashOpen + revOpen, foreNext = cashNext + revNext;

    return {
      rows,
      cash:     { open: cashOpen, next: cashNext, total: cashOpen + cashNext },
      request:  { open: outOpen,  next: outNext,  total: outOpen + outNext },
      forecast: { open: foreOpen, next: foreNext, total: foreOpen + foreNext },
    };
  }, [liquidity, meta]);

  // ── Item modal helpers ─────────────────────────────────────────────────────

  const openCreateItem = (presetCategory?: string, presetPerson?: string) => {
    setFCategory(presetCategory ?? meta?.categories[0] ?? "");
    setFPerson(presetPerson ?? "");
    setFAssignee("");
    setFRef(""); setFDate(new Date().toISOString().split("T")[0]);
    setFClient(""); setFStatus("Pending"); setFComment(""); setFAmount("");
    setModalError(null);
    setItemModal({ mode: "create", presetCategory, presetPerson });
  };

  const openEditItem = (item: SnapshotItem) => {
    setFCategory(item.category); setFPerson(item.person); setFRef(item.ref);
    setFAssignee(item.assigned_admin_id ? String(item.assigned_admin_id) : "");
    setFDate(item.date ?? ""); setFClient(item.client ?? "");
    setFStatus(item.status); setFComment(item.comment ?? "");
    setFAmount(String(item.amount));
    setModalError(null);
    setItemModal({ mode: "edit", item });
  };

  // Picking a staff member fills the display name too (still editable) — the
  // tag is what notifies them and routes the record to their My Work queue.
  const pickAssignee = (value: string) => {
    setFAssignee(value);
    if (value) {
      const staff = meta?.staff.find((s) => String(s.id) === value);
      if (staff) setFPerson(staff.name);
    }
  };

  const submitItem = (e: React.FormEvent) => {
    e.preventDefault();
    const input: ItemInput = {
      category: fCategory, person: fPerson.trim(), ref: fRef.trim(),
      assigned_admin_id: fAssignee ? Number(fAssignee) : null,
      date: fDate || null, client: fClient.trim() || null,
      status: fStatus, comment: fComment.trim() || null,
      amount: parseFloat(fAmount) || 0,
    };
    setSaving(true);
    setModalError(null);
    startTransition(async () => {
      const res = itemModal?.mode === "edit" && itemModal.item
        ? await updateItem(itemModal.item.id, input)
        : await createItem(input);
      setSaving(false);
      if (res.error || !res.item) { setModalError(res.error ?? "Save failed."); return; }
      const saved = res.item;
      setItems((prev) => {
        const exists = prev.some((i) => i.id === saved.id);
        return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved];
      });
      setItemModal(null);
    });
  };

  const removeItem = (id: number) => {
    if (!window.confirm("Delete this record?")) return;
    startTransition(async () => {
      const res = await deleteItem(id);
      if (res.error) { setNotice(res.error); return; }
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  };

  // ── Liquidity modal helpers ────────────────────────────────────────────────

  const liqModalEntries = liqModal
    ? liquidity.filter((e) => e.line === liqModal.line && e.period === liqModal.period)
    : [];

  const submitLiquidityLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liqModal) return;
    const input = {
      line: liqModal.line, period: liqModal.period,
      description: lDesc.trim(), reference: lRef.trim() || null,
      amount: parseFloat(lAmount) || 0,
    };
    setSaving(true);
    startTransition(async () => {
      const res = await createLiquidityEntry(input);
      setSaving(false);
      if (res.error || !res.entry) { setModalError(res.error ?? "Save failed."); return; }
      setLiquidity((prev) => [...prev, res.entry!]);
      setLDesc(""); setLRef(""); setLAmount("");
    });
  };

  const patchLiquidity = (entry: LiquidityEntry, field: "description" | "reference" | "amount", value: string) => {
    const next = {
      line: entry.line, period: entry.period,
      description: field === "description" ? value : entry.description,
      reference: field === "reference" ? (value || null) : entry.reference,
      amount: field === "amount" ? (parseFloat(value) || 0) : entry.amount,
    };
    startTransition(async () => {
      const res = await updateLiquidityEntry(entry.id, next);
      if (res.error || !res.entry) { setNotice(res.error ?? "Update failed."); return; }
      setLiquidity((prev) => prev.map((x) => (x.id === entry.id ? res.entry! : x)));
    });
  };

  const removeLiquidity = (id: number) => {
    startTransition(async () => {
      const res = await deleteLiquidityEntry(id);
      if (res.error) { setNotice(res.error); return; }
      setLiquidity((prev) => prev.filter((x) => x.id !== id));
    });
  };

  // ── Backup / restore / CSV ─────────────────────────────────────────────────

  const downloadBackup = () => {
    // Exported in the SAME shape as the original board, so a file from here
    // restores there and vice versa.
    const lines = meta?.liquidity_lines ?? [];
    const liquidityItems = lines.map((l) => ({
      id: l.key, label: l.label,
      openCurrent: liquidity.filter((e) => e.line === l.key && e.period === "open_current")
        .map((e) => ({ id: e.id, desc: e.description, ref: e.reference ?? "", amount: e.amount })),
      nextMonth: liquidity.filter((e) => e.line === l.key && e.period === "next_month")
        .map((e) => ({ id: e.id, desc: e.description, ref: e.reference ?? "", amount: e.amount })),
    }));
    const blob = new Blob(
      [JSON.stringify({ items, liquidityItems }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `financial_snapshot_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!window.confirm("Restoring a backup REPLACES everything currently on the board. Continue?")) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try { parsed = JSON.parse(String(reader.result)); }
      catch { setNotice("That file is not valid JSON."); return; }
      startTransition(async () => {
        const res = await restoreBackup(parsed);
        if (res.error) { setNotice(res.error); return; }
        setNotice(res.message ?? "Backup restored.");
        load();
      });
    };
    reader.readAsText(file);
  };

  const onCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !meta) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSV(String(reader.result), meta.categories);
      if (rows.length === 0) { setNotice("No usable rows found in that CSV."); return; }
      startTransition(async () => {
        const res = await bulkAddItems(rows);
        if (res.error) { setNotice(res.error); return; }
        setNotice(res.message ?? `${rows.length} record(s) added from CSV.`);
        load();
      });
    };
    reader.readAsText(file);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[#E85C1A]" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={32} className="mb-3 text-amber-400" strokeWidth={1.5} />
        <p className="mb-1 text-[1rem] font-bold text-[#1a1a1a]">Finance snapshot unavailable</p>
        <p className="mb-5 max-w-sm text-[0.83rem] text-[#6b7280]">{pageError}</p>
        <button type="button" onClick={() => { setLoading(true); load(); }}
          className="flex items-center gap-2 rounded-full bg-[#E85C1A] px-5 py-2.5 text-[0.85rem] font-semibold text-white transition hover:bg-[#d14f14]">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const categories = meta?.categories ?? [];

  return (
    <div className="p-6 lg:p-8 print:p-0">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2.5">
          <LineChart size={18} className="text-[#E85C1A]" strokeWidth={2} />
          <div>
            <h1 className="text-[1.15rem] font-extrabold text-[#1a1a1a]">Finance Snapshot</h1>
            <p className="text-[0.8rem] text-[#6b7280]">Pipeline by staff member, and the liquidity working</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-2 text-[0.78rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5]">
            <Printer size={13} /> Print
          </button>
          <button type="button" onClick={downloadBackup} className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-2 text-[0.78rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5]">
            <Download size={13} /> Backup JSON
          </button>
          <button type="button" onClick={() => jsonInputRef.current?.click()} className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-2 text-[0.78rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5]">
            <Upload size={13} /> Restore JSON
          </button>
          <button type="button" onClick={() => csvInputRef.current?.click()} className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-2 text-[0.78rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5]">
            <FileUp size={13} /> Upload CSV
          </button>
          <button type="button" onClick={() => openCreateItem()} className="flex items-center gap-1.5 rounded-full bg-[#E85C1A] px-4 py-2 text-[0.78rem] font-semibold text-white transition hover:bg-[#d44f12]">
            <Plus size={13} /> Add Record
          </button>
          <input ref={jsonInputRef} type="file" accept=".json" className="hidden" onChange={onRestoreFile} />
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={onCSVFile} />
        </div>
      </div>

      {notice && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-[0.83rem] text-blue-800 print:hidden">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}><X size={13} /></button>
        </div>
      )}

      {/* ── The six category boxes ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          const total = catItems.reduce((s, i) => s + i.amount, 0);
          const byPerson = new Map<string, { count: number; total: number }>();
          catItems.forEach((i) => {
            const p = i.person.trim();
            const cur = byPerson.get(p) ?? { count: 0, total: 0 };
            byPerson.set(p, { count: cur.count + 1, total: cur.total + i.amount });
          });

          return (
            <div key={cat} className="flex min-h-[220px] flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.06]">
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="rounded-lg bg-[#1a1a1a] px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-white">{cat}</span>
                <div className="text-right">
                  <span className="text-[1.3rem] font-extrabold leading-none text-[#1a1a1a]">{fmt(total)}</span>
                  <span className="ml-1.5 text-[0.75rem] font-bold text-[#6b7280]">{catItems.length} items</span>
                </div>
              </div>
              <p className="mb-3 text-[0.75rem] font-semibold text-[#9ca3af]">{byPerson.size} staff handling</p>

              <div className="flex flex-1 flex-col gap-1.5">
                {byPerson.size === 0 && (
                  <p className="py-3 text-[0.78rem] italic text-[#9ca3af]">No active records in this section.</p>
                )}
                {[...byPerson.entries()].map(([person, agg], idx) => (
                  <button
                    key={person}
                    type="button"
                    onClick={() => setDrill({ category: cat, person })}
                    className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-[#f8f9fa] px-3 py-2 text-left transition hover:bg-[#f0f2f5]"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-[0.7rem] font-extrabold text-[#9ca3af]">{idx + 1}.</span>
                      <span>
                        <span className="block text-[0.8rem] font-bold text-[#1a1a1a]">{person}</span>
                        <span className="block text-[0.68rem] font-semibold text-[#9ca3af]">{agg.count} {agg.count === 1 ? "item" : "items"}</span>
                      </span>
                    </span>
                    <span className="text-[0.83rem] font-extrabold text-[#1a1a1a]">{fmt(agg.total)}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => openCreateItem(cat)}
                className="mt-3 self-start text-[0.72rem] font-semibold text-[#E85C1A] transition hover:text-[#d14f14] print:hidden"
              >
                + Add to {cat.toLowerCase()}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Liquidity working ── */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
        <div className="bg-[#1a1a1a] px-4 py-3 text-center text-[0.8rem] font-extrabold uppercase tracking-wide text-white">
          Finance Liquidity Working
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[0.8rem]">
            <thead>
              <tr className="border-b border-black/[0.08] bg-amber-400/90 text-[#1a1a1a]">
                <th className="px-4 py-2 text-left font-extrabold">Item</th>
                <th className="px-4 py-2 text-right font-extrabold">Open Current Month</th>
                <th className="px-4 py-2 text-right font-extrabold">Next Month Forecast</th>
                <th className="px-4 py-2 text-right font-extrabold">Total</th>
              </tr>
            </thead>
            <tbody>
              {liq.rows.filter((r) => r.key !== "revenue_payment").map((r) => (
                <LiquidityRow key={r.key} row={r}
                  onOpen={(period) => { setModalError(null); setLDesc(""); setLRef(""); setLAmount(""); setLiqModal({ line: r.key, label: r.label, period }); }} />
              ))}

              <tr className="border-t-2 border-black/20 font-bold">
                <td className="px-4 py-2">Cash Position</td>
                {[liq.cash.open, liq.cash.next, liq.cash.total].map((v, i) => (
                  <td key={i} className={`px-4 py-2 text-right font-mono ${v >= 0 ? "bg-emerald-100" : "bg-red-200"}`}>{fmt(v)}</td>
                ))}
              </tr>
              <tr className="bg-amber-400/90 font-extrabold">
                <td className="px-4 py-2">Liquidity Injection Request</td>
                {[liq.request.open, liq.request.next, liq.request.total].map((v, i) => (
                  <td key={i} className="px-4 py-2 text-right font-mono">{fmt(v)}</td>
                ))}
              </tr>
              <tr><td colSpan={4} className="h-3" /></tr>
              {liq.rows.filter((r) => r.key === "revenue_payment").map((r) => (
                <LiquidityRow key={r.key} row={r}
                  onOpen={(period) => { setModalError(null); setLDesc(""); setLRef(""); setLAmount(""); setLiqModal({ line: r.key, label: r.label, period }); }} />
              ))}
              <tr className="border-t border-black/10 font-bold">
                <td className="px-4 py-2">Forecasted Cash Position</td>
                {[liq.forecast.open, liq.forecast.next, liq.forecast.total].map((v, i) => (
                  <td key={i} className={`px-4 py-2 text-right font-mono ${v >= 0 ? "bg-emerald-100" : "bg-red-200"}`}>{fmt(v)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="px-4 py-2 text-[0.7rem] text-[#9ca3af] print:hidden">Click any amount to view and edit its breakdown.</p>

        {/* The weekly view is part of the liquidity working, per finance —
            "we are currently in week 35": the current ISO week plus the three
            ahead, bank balance per week, rolling with the calendar. */}
        <div className="border-t border-black/[0.08] p-4">
          <p className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-wide text-[#5c5e62]">
            Liquidity by week — current + 3, rolling
          </p>
          <LiquidityLadder />
        </div>
      </div>

      {/* ── Drill-down modal: one person in one category ── */}
      {drill && (
        <Modal onClose={() => { setDrill(null); setHighlightId(null); }} title={`${drill.person} — ${drill.category}`} wide>
          {(() => {
            const personItems = items.filter(
              (i) => i.category === drill.category && i.person.trim().toLowerCase() === drill.person.trim().toLowerCase()
            );
            const total = personItems.reduce((s, i) => s + i.amount, 0);
            return (
              <>
                <p className="mb-3 text-[0.8rem] font-semibold text-[#6b7280]">
                  Total: {fmt(total)} ({personItems.length} items)
                </p>
                {/* No min-width and no truncation: long client names and
                    emails wrap onto a second line, so nothing hides behind a
                    horizontal scrollbar. */}
                <div>
                  <table className="w-full text-left text-[0.8rem]">
                    <thead>
                      <tr className="border-b border-black/[0.08] bg-[#f8f9fa] text-[#6b7280]">
                        <th className="px-3 py-2 font-bold">Ref #</th>
                        <th className="px-3 py-2 font-bold">Date</th>
                        <th className="px-3 py-2 font-bold">Client</th>
                        <th className="px-3 py-2 font-bold">Status</th>
                        <th className="px-3 py-2 font-bold">Comment</th>
                        <th className="px-3 py-2 text-right font-bold">Amount</th>
                        <th className="px-3 py-2 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.05]">
                      {personItems.map((item) => (
                        <tr key={item.id}
                          ref={item.id === highlightId ? (el) => el?.scrollIntoView({ block: "center" }) : undefined}
                          className={item.id === highlightId ? "bg-amber-50 ring-2 ring-inset ring-amber-300" : undefined}>
                          <td className="px-3 py-2 font-bold">{item.ref}</td>
                          <td className="whitespace-nowrap px-3 py-2">{item.date ?? "—"}</td>
                          <td className="whitespace-normal break-words px-3 py-2">{item.client ?? "—"}</td>
                          <td className="px-3 py-2">
                            <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${STATUS_COLORS[item.status] ?? "bg-gray-100 text-gray-600"}`}>{item.status}</span>
                            {item.assigned_admin_id && (
                              <span title={`Tagged: ${item.assignee_name ?? ""} — notified and in their My Work`}
                                className="ml-1 whitespace-nowrap rounded-full bg-indigo-100 px-2 py-0.5 text-[0.65rem] font-bold text-indigo-700">
                                @{item.assignee_name ?? "tagged"}
                              </span>
                            )}
                          </td>
                          <td className="whitespace-normal break-words px-3 py-2 italic text-[#6b7280]">{item.comment ?? "—"}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-right font-bold">{fmt(item.amount)}</td>
                          <td className="px-3 py-2">
                            <span className="flex justify-end gap-1.5">
                              <button type="button" title="Edit" onClick={() => openEditItem(item)}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-black/[0.09] text-[#6b7280] transition hover:border-[#E85C1A] hover:text-[#E85C1A]">
                                <Pencil size={11} />
                              </button>
                              <button type="button" title="Delete" onClick={() => removeItem(item.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-black/[0.09] text-[#6b7280] transition hover:border-red-400 hover:text-red-500">
                                <Trash2 size={11} />
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={() => openCreateItem(drill.category, drill.person)}
                  className="mt-4 flex items-center gap-1.5 rounded-full bg-[#E85C1A] px-4 py-2 text-[0.78rem] font-semibold text-white transition hover:bg-[#d44f12]">
                  <Plus size={13} /> Add for {drill.person}
                </button>
              </>
            );
          })()}
        </Modal>
      )}

      {/* ── Add / edit record modal ── */}
      {itemModal && meta && (
        <Modal onClose={() => setItemModal(null)} title={itemModal.mode === "create" ? "Add New Record" : "Edit Record"}>
          {modalError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[0.83rem] text-red-700">
              <AlertCircle size={13} className="shrink-0" /> {modalError}
            </div>
          )}
          <form onSubmit={submitItem} className="space-y-3">
            <Field label="Category">
              <select value={fCategory} onChange={(e) => setFCategory(e.target.value)} className={`${inputCls} cursor-pointer`}>
                {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Tag a staff member (they get notified + it lands in their My Work)">
              <select value={fAssignee} onChange={(e) => pickAssignee(e.target.value)} className={`${inputCls} cursor-pointer`}>
                <option value="">— No tag (name only) —</option>
                {meta.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Person (display name)">
                <input type="text" value={fPerson} onChange={(e) => setFPerson(e.target.value)} placeholder="e.g. Edinah" required className={inputCls} />
              </Field>
              <Field label="Ref #">
                <input type="text" value={fRef} onChange={(e) => setFRef(e.target.value)} placeholder="e.g. AN-1271" required className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Amount">
                <input type="number" step="0.01" value={fAmount} onChange={(e) => setFAmount(e.target.value)} placeholder="0.00" required className={inputCls} />
              </Field>
            </div>
            <Field label="Client name & address">
              <input type="text" value={fClient} onChange={(e) => setFClient(e.target.value)} placeholder="e.g. Hipf Wolfgang, Unterföhring" className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className={`${inputCls} cursor-pointer`}>
                {meta.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Status comment / notes">
              <textarea value={fComment} onChange={(e) => setFComment(e.target.value)} rows={2} placeholder="e.g. Edinah to contact client" className={`${inputCls} h-auto py-2`} />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setItemModal(null)} className="h-9 rounded-full border border-black/10 px-4 text-[0.8rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5]">Cancel</button>
              <button type="submit" disabled={saving} className="h-9 rounded-full bg-[#E85C1A] px-5 text-[0.8rem] font-semibold text-white transition hover:bg-[#d44f12] disabled:opacity-60">
                {saving ? "Saving…" : itemModal.mode === "create" ? "Save Record" : "Update"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Liquidity breakdown modal ── */}
      {liqModal && (
        <Modal onClose={() => setLiqModal(null)} title={`${liqModal.label} — ${liqModal.period === "open_current" ? "Open Current Month" : "Next Month Forecast"}`} wide>
          {modalError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[0.83rem] text-red-700">
              <AlertCircle size={13} className="shrink-0" /> {modalError}
            </div>
          )}
          <table className="w-full text-left text-[0.8rem]">
            <thead>
              <tr className="border-b border-black/[0.08] bg-[#f8f9fa] text-[#6b7280]">
                <th className="px-3 py-2 font-bold">Description / Note</th>
                <th className="px-3 py-2 font-bold">Reference / Vendor</th>
                <th className="px-3 py-2 text-right font-bold">Amount</th>
                <th className="px-3 py-2 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {liqModalEntries.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-4 text-center italic text-[#9ca3af]">No entries for this line and period yet. Add one below.</td></tr>
              )}
              {liqModalEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-3 py-1.5">
                    <input type="text" defaultValue={entry.description} onBlur={(e) => e.target.value !== entry.description && patchLiquidity(entry, "description", e.target.value)} className={inputCls} />
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="text" defaultValue={entry.reference ?? ""} onBlur={(e) => e.target.value !== (entry.reference ?? "") && patchLiquidity(entry, "reference", e.target.value)} className={inputCls} />
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <input type="number" step="0.01" defaultValue={entry.amount} onBlur={(e) => parseFloat(e.target.value) !== entry.amount && patchLiquidity(entry, "amount", e.target.value)} className={`${inputCls} w-32 text-right font-bold`} />
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <button type="button" onClick={() => removeLiquidity(entry.id)}
                      className="rounded-lg bg-red-500 px-2.5 py-1 text-[0.7rem] font-semibold text-white transition hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={submitLiquidityLine} className="mt-4 flex flex-wrap gap-2 border-t border-black/[0.06] pt-4">
            <input type="text" value={lDesc} onChange={(e) => setLDesc(e.target.value)} placeholder="Description / note" required className={`${inputCls} min-w-[180px] flex-[2]`} />
            <input type="text" value={lRef} onChange={(e) => setLRef(e.target.value)} placeholder="Ref / vendor (optional)" className={`${inputCls} min-w-[120px] flex-1`} />
            <input type="number" step="0.01" value={lAmount} onChange={(e) => setLAmount(e.target.value)} placeholder="Amount (e.g. 5000 or -2000)" required className={`${inputCls} min-w-[140px] flex-1`} />
            <button type="submit" disabled={saving} className="h-9 rounded-full bg-[#E85C1A] px-4 text-[0.78rem] font-semibold text-white transition hover:bg-[#d44f12] disabled:opacity-60">+ Add Line</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ── Small building blocks ─────────────────────────────────────────────────────

function LiquidityRow({
  row,
  onOpen,
}: {
  row: { key: string; label: string; open: number; next: number; total: number };
  onOpen: (period: "open_current" | "next_month") => void;
}) {
  const isPositiveLine = row.key === "bank_balance" || row.key === "revenue_payment";
  const cellBg = (v: number) => (v === 0 ? "" : isPositiveLine ? "bg-emerald-100" : "bg-red-200");
  return (
    <tr className="border-b border-black/[0.05]">
      <td className="px-4 py-2 font-bold">{row.label}</td>
      <td className={`cursor-pointer px-4 py-2 text-right font-mono transition hover:brightness-95 ${cellBg(row.open)}`} onClick={() => onOpen("open_current")}>{fmt(row.open)}</td>
      <td className={`cursor-pointer px-4 py-2 text-right font-mono transition hover:brightness-95 ${cellBg(row.next)}`} onClick={() => onOpen("next_month")}>{fmt(row.next)}</td>
      <td className={`px-4 py-2 text-right font-mono ${row.total === 0 ? "" : row.total >= 0 ? "bg-emerald-100" : "bg-red-200"}`}>{fmt(row.total)}</td>
    </tr>
  );
}

function Modal({ title, wide, onClose, children }: { title: string; wide?: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
      <div role="presentation" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative flex max-h-[85vh] w-full flex-col rounded-2xl bg-white shadow-xl ${wide ? "max-w-4xl" : "max-w-md"}`}>
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
          <h2 className="text-[0.95rem] font-extrabold text-[#1a1a1a]">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5c5e62] transition hover:bg-[#f0f2f5]">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">{label}</label>
      {children}
    </div>
  );
}
