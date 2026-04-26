"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  ShoppingBag,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type EbayStatus = "Active" | "Ended" | "Completed" | "Unknown" | null;

type Product = {
  id:            number;
  sku:           string;
  brand:         string;
  name:          string;
  size:          string;
  type:          string;
  price:         number;
  is_active:     boolean;
  ebay_listed:   boolean;
  ebay_item_id?: string | null;
  ebay_status?:  EbayStatus;
  image_url?:    string | null;
};

type Meta = {
  total?:        number;
  current_page?: number;
  last_page?:    number;
};

type SyncData = {
  activeCount: number;
  activeSKUs:  string[];
  listings:    { itemId: string; title: string; sku?: string; quantity?: number; price?: number }[];
  syncedAt?:   string;
  error?:      string;
};

type BulkResult = { listed: number; failed: number; errors: string[] };

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EbayStatus }) {
  if (!status || status === "Unknown") return null;

  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[0.68rem] font-bold text-green-700">
        <CheckCircle2 size={10} strokeWidth={2.5} />
        Active
      </span>
    );
  }
  if (status === "Ended" || status === "Completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[0.68rem] font-bold text-red-700">
        <XCircle size={10} strokeWidth={2.5} />
        {status}
      </span>
    );
  }
  return null;
}

function EbayBadge({ itemId }: { itemId?: string | null }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[0.68rem] font-bold text-green-700">
      <ShoppingBag size={10} strokeWidth={2.5} />
      eBay Live
      {itemId && (
        <a
          href={`https://www.ebay.de/itm/${itemId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 font-mono text-[0.65rem] text-green-600 underline hover:text-green-800"
          title="View on eBay"
          onClick={(e) => e.stopPropagation()}
        >
          #{itemId}
        </a>
      )}
    </span>
  );
}

function StatCards({
  listedCount,
  totalCount,
  ebayCount,
  syncing,
  syncedAt,
}: {
  listedCount: number;
  totalCount:  number;
  ebayCount:   number | null;
  syncing:     boolean;
  syncedAt?:   string;
}) {
  const displayListed = ebayCount !== null ? ebayCount : listedCount;

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500">
          <ShoppingBag size={20} strokeWidth={1.8} className="text-white" />
        </div>
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#5c5e62]">Listed on eBay</p>
          <p className="mt-0.5 text-2xl font-extrabold text-[#1a1a1a]">
            {syncing ? <Loader2 size={18} className="inline animate-spin" /> : displayListed}
          </p>
          {syncedAt && !syncing && (
            <p className="mt-0.5 text-[0.65rem] text-[#aaa]">
              from eBay · {new Date(syncedAt).toLocaleTimeString()}
            </p>
          )}
          {ebayCount === null && !syncing && (
            <p className="mt-0.5 text-[0.65rem] text-[#aaa]">from local data</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E85C1A]">
          <ShoppingBag size={20} strokeWidth={1.8} className="text-white" />
        </div>
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#5c5e62]">Unlisted Products</p>
          <p className="mt-0.5 text-2xl font-extrabold text-[#1a1a1a]">
            {totalCount - listedCount}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500">
          <ShoppingBag size={20} strokeWidth={1.8} className="text-white" />
        </div>
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#5c5e62]">Total Products</p>
          <p className="mt-0.5 text-2xl font-extrabold text-[#1a1a1a]">{totalCount}</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EbayPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "listed" | "unlisted">("all");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [, startTransition] = useTransition();

  // eBay sync state
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Per-product action loading
  const [actionLoading, setActionLoading] = useState<Set<number>>(new Set());

  // ── Fetch products ──────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (opts?: { q?: string; filter?: string; page?: number }) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    const qVal      = opts?.q      !== undefined ? opts.q      : q;
    const filterVal = opts?.filter !== undefined ? opts.filter : filter;
    const pageVal   = opts?.page   !== undefined ? opts.page   : page;

    if (qVal.trim()) params.set("q", qVal.trim());
    if (filterVal === "listed")   params.set("ebay_listed", "1");
    if (filterVal === "unlisted") params.set("ebay_listed", "0");
    params.set("per_page", "25");
    params.set("page", String(pageVal));

    try {
      const res = await fetch(`/api/admin/products?${params}`);
      if (res.status === 401) { setError("Session expired. Please log in again."); return; }
      const json = await res.json() as { data?: Product[] };
      setProducts(Array.isArray(json.data) ? json.data : []);
      setMeta((json as { meta?: Meta }).meta ?? {});
    } catch {
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { void fetchProducts(); }, [fetchProducts]);

  // ── eBay Sync ───────────────────────────────────────────────────────────────

  const handleSync = async () => {
    setSyncing(true);
    setActionError(null);
    try {
      const res  = await fetch("/api/admin/ebay/sync");
      const data = await res.json() as SyncData;
      if (data.error && !data.listings) {
        setActionError(`Sync error: ${data.error}`);
      } else {
        setSyncData(data);
        // Update local ebay_listed flags based on eBay's active SKU list
        if (data.activeSKUs.length > 0) {
          setProducts((prev) =>
            prev.map((p) => ({
              ...p,
              ebay_listed: data.activeSKUs.includes(p.sku),
              ebay_status: data.activeSKUs.includes(p.sku) ? "Active" : p.ebay_status ?? null,
            }))
          );
        }
      }
    } catch {
      setActionError("Sync failed — could not reach eBay API.");
    } finally {
      setSyncing(false);
    }
  };

  // ── Per-product eBay toggle ─────────────────────────────────────────────────

  const toggleEbay = async (product: Product) => {
    setActionError(null);
    setBulkResult(null);
    setActionLoading((prev) => new Set(prev).add(product.id));

    const endpoint = product.ebay_listed
      ? `/api/admin/products/${product.id}/ebay/remove`
      : `/api/admin/products/${product.id}/ebay/list`;
    const method = product.ebay_listed ? "DELETE" : "POST";

    try {
      const res  = await fetch(endpoint, { method });
      const json = await res.json().catch(() => ({} as Record<string, unknown>));
      if (!res.ok) {
        setActionError(
          typeof json.error === "string" ? json.error :
          typeof json.message === "string" ? json.message :
          "eBay action failed."
        );
      } else {
        const itemId = typeof json.itemId === "string" ? json.itemId : null;
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  ebay_listed:  !p.ebay_listed,
                  ebay_item_id: product.ebay_listed ? null : (itemId ?? p.ebay_item_id),
                  ebay_status:  product.ebay_listed ? null : "Active",
                }
              : p
          )
        );
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  // ── Bulk list ───────────────────────────────────────────────────────────────

  const handleBulkList = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkProgress({ done: 0, total: ids.length });
    setBulkResult(null);
    setActionError(null);

    startTransition(async () => {
      let listed = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const id of ids) {
        try {
          const res  = await fetch(`/api/admin/products/${id}/ebay/list`, { method: "POST" });
          const json = await res.json().catch(() => ({} as Record<string, unknown>));
          if (res.ok) {
            const itemId = typeof json.itemId === "string" ? json.itemId : null;
            listed++;
            setProducts((prev) =>
              prev.map((p) =>
                p.id === id
                  ? { ...p, ebay_listed: true, ebay_item_id: itemId ?? p.ebay_item_id, ebay_status: "Active" }
                  : p
              )
            );
          } else {
            failed++;
            const msg = typeof json.error === "string" ? json.error : `Product ${id} failed`;
            errors.push(msg);
          }
        } catch {
          failed++;
          errors.push(`Product ${id}: network error`);
        }
        setBulkProgress((prev) => prev ? { ...prev, done: prev.done + 1 } : null);
      }

      setBulkProgress(null);
      setBulkResult({ listed, failed, errors });
      setSelected(new Set());
    });
  };

  // ── Selection helpers ───────────────────────────────────────────────────────

  const unlistedProducts   = products.filter((p) => !p.ebay_listed);
  const allUnlistedSelected =
    unlistedProducts.length > 0 && unlistedProducts.every((p) => selected.has(p.id));

  const toggleSelectAll = () => {
    setSelected(allUnlistedSelected ? new Set() : new Set(unlistedProducts.map((p) => p.id)));
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Computed ────────────────────────────────────────────────────────────────

  const listedCount = products.filter((p) => p.ebay_listed).length;
  const totalCount  = meta.total ?? products.length;
  const lastPage    = meta.last_page ?? 1;

  const handleFilterChange = (val: "all" | "listed" | "unlisted") => {
    setFilter(val);
    setPage(1);
    setSelected(new Set());
    void fetchProducts({ filter: val, page: 1 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchProducts({ page: 1 });
  };

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">Sales Channels</p>
          <p className="mt-1 text-[0.875rem] text-[#5c5e62]">Manage which products are listed on eBay.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleSync()}
            disabled={syncing}
            title="Sync listing status from eBay"
            className="flex items-center gap-1.5 rounded-xl border border-black/[0.09] bg-white px-3.5 py-2 text-[0.8rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5] disabled:opacity-50"
          >
            <RefreshCw size={13} strokeWidth={2} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync from eBay"}
          </button>
          <a
            href="https://www.ebay.de/sh/ovw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-black/[0.09] bg-white px-3.5 py-2 text-[0.8rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5]"
          >
            <ExternalLink size={13} strokeWidth={2} />
            Seller Hub
          </a>
        </div>
      </div>

      {/* Stat cards */}
      <StatCards
        listedCount={listedCount}
        totalCount={totalCount}
        ebayCount={syncData ? syncData.activeCount : null}
        syncing={syncing}
        syncedAt={syncData?.syncedAt}
      />

      {/* Error banners */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.83rem] text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}
      {actionError && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.83rem] text-red-700">
          <span className="flex items-start gap-2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {actionError}
          </span>
          <button type="button" onClick={() => setActionError(null)} className="shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Bulk result banner */}
      {bulkResult && (
        <div
          className={[
            "mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-[0.83rem]",
            bulkResult.failed > 0
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-green-200 bg-green-50 text-green-800",
          ].join(" ")}
        >
          <div>
            <p className="font-semibold">
              Bulk listing complete — {bulkResult.listed} listed
              {bulkResult.failed > 0 && `, ${bulkResult.failed} failed`}.
            </p>
            {bulkResult.errors.slice(0, 3).map((e, i) => (
              <p key={i} className="mt-0.5 text-[0.78rem] opacity-80">{e}</p>
            ))}
          </div>
          <button type="button" onClick={() => setBulkResult(null)} className="shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Bulk progress bar */}
      {bulkProgress && (
        <div className="mb-4 overflow-hidden rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-[0.83rem] font-semibold text-green-800">
            <span>Listing products on eBay…</span>
            <span>{bulkProgress.done} / {bulkProgress.total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-green-200">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${Math.round((bulkProgress.done / bulkProgress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && !bulkProgress && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-[0.83rem] font-semibold text-green-800">
            {selected.size} product{selected.size > 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBulkList}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-1.5 text-[0.8rem] font-semibold text-white transition hover:bg-green-700"
            >
              <ShoppingBag size={13} strokeWidth={2} />
              List on eBay
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-[0.78rem] font-semibold text-green-700 underline hover:text-green-900"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c5e62]" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by SKU, brand, name…"
              className="h-10 w-full rounded-xl border border-black/[0.09] bg-white pl-9 pr-4 text-[0.875rem] text-[#1a1a1a] outline-none placeholder:text-[#aaa] transition focus:border-[#E85C1A] focus:ring-2 focus:ring-[#E85C1A]/10"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-xl bg-[#1a1a1a] px-4 text-[0.875rem] font-semibold text-white transition hover:bg-[#333]"
          >
            Search
          </button>
        </form>

        <div className="flex gap-1.5">
          {(["all", "listed", "unlisted"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => handleFilterChange(f)}
              className={[
                "h-10 rounded-xl px-3.5 text-[0.8rem] font-semibold capitalize transition",
                filter === f
                  ? "bg-[#E85C1A] text-white"
                  : "border border-black/[0.09] bg-white text-[#5c5e62] hover:border-[#E85C1A] hover:text-[#E85C1A]",
              ].join(" ")}
            >
              {f === "all" ? "All" : f === "listed" ? "eBay Live" : "Not Listed"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void fetchProducts()}
            title="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.09] bg-white text-[#5c5e62] transition hover:text-[#1a1a1a]"
          >
            <RefreshCw size={14} strokeWidth={2} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                <th className="px-4 py-3">
                  <button type="button" onClick={toggleSelectAll} className="text-[#5c5e62] hover:text-[#1a1a1a]">
                    {allUnlistedSelected
                      ? <CheckSquare size={15} strokeWidth={2} className="text-[#E85C1A]" />
                      : <Square     size={15} strokeWidth={1.8} />}
                  </button>
                </th>
                {["SKU / Name", "Brand", "Size", "Price", "eBay Status", "Listing ID", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#5c5e62]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 size={20} className="mx-auto animate-spin text-[#5c5e62]" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[0.875rem] text-[#5c5e62]">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isActing = actionLoading.has(product.id);
                  return (
                    <tr key={product.id} className="group transition hover:bg-[#fafafa]">

                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        {!product.ebay_listed && (
                          <button
                            type="button"
                            onClick={() => toggleSelect(product.id)}
                            className="text-[#5c5e62] hover:text-[#E85C1A]"
                          >
                            {selected.has(product.id)
                              ? <CheckSquare size={15} strokeWidth={2} className="text-[#E85C1A]" />
                              : <Square     size={15} strokeWidth={1.8} />}
                          </button>
                        )}
                      </td>

                      {/* Name + SKU */}
                      <td className="px-4 py-3">
                        <p className="text-[0.82rem] font-extrabold text-[#1a1a1a]">{product.name}</p>
                        <p className="text-[0.73rem] font-mono text-[#5c5e62]">{product.sku}</p>
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3 text-[0.875rem] text-[#1a1a1a]">{product.brand}</td>

                      {/* Size */}
                      <td className="px-4 py-3 text-[0.875rem] text-[#5c5e62]">{product.size}</td>

                      {/* Price */}
                      <td className="px-4 py-3 text-[0.875rem] font-semibold text-[#1a1a1a]">
                        €{Number(product.price).toFixed(2)}
                      </td>

                      {/* eBay Status */}
                      <td className="px-4 py-3">
                        {product.ebay_listed ? (
                          <div className="flex flex-col gap-1">
                            <EbayBadge itemId={product.ebay_item_id} />
                            {product.ebay_status && <StatusBadge status={product.ebay_status} />}
                          </div>
                        ) : (
                          <span className="text-[0.72rem] text-[#aaa]">Not listed</span>
                        )}
                      </td>

                      {/* Listing ID */}
                      <td className="px-4 py-3">
                        {product.ebay_item_id ? (
                          <a
                            href={`https://www.ebay.de/itm/${product.ebay_item_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-[0.72rem] text-blue-600 underline hover:text-blue-800"
                          >
                            {product.ebay_item_id}
                            <ExternalLink size={9} strokeWidth={2} />
                          </a>
                        ) : (
                          <span className="text-[0.72rem] text-[#ccc]">—</span>
                        )}
                      </td>

                      {/* Action button */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void toggleEbay(product)}
                          disabled={isActing}
                          className={[
                            "flex h-8 min-w-[88px] items-center justify-center gap-1.5 rounded-lg px-3 text-[0.78rem] font-semibold transition disabled:opacity-50",
                            product.ebay_listed
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100",
                          ].join(" ")}
                        >
                          {isActing ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : product.ebay_listed ? (
                            <>
                              <XCircle size={12} strokeWidth={2} />
                              Remove
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={12} strokeWidth={2} />
                              List on eBay
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-3">
            <p className="text-[0.78rem] text-[#5c5e62]">
              Page {page} of {lastPage}
              {typeof meta.total === "number" && ` · ${meta.total} products`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => { setPage(page - 1); void fetchProducts({ page: page - 1 }); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.09] bg-white text-[#1a1a1a] transition hover:border-[#E85C1A] hover:text-[#E85C1A] disabled:pointer-events-none disabled:bg-[#f5f5f5] disabled:text-[#ccc]"
              >
                ‹
              </button>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => { setPage(page + 1); void fetchProducts({ page: page + 1 }); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.09] bg-white text-[#1a1a1a] transition hover:border-[#E85C1A] hover:text-[#E85C1A] disabled:pointer-events-none disabled:bg-[#f5f5f5] disabled:text-[#ccc]"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sync info */}
      {syncData && !syncing && (
        <div className="mt-4 flex items-center gap-2 text-[0.75rem] text-[#5c5e62]">
          <Clock size={12} />
          Last synced from eBay at {new Date(syncData.syncedAt ?? "").toLocaleTimeString()}
          · {syncData.activeCount} active listing{syncData.activeCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
