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
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Product = {
  id: number;
  sku: string;
  brand: string;
  name: string;
  size: string;
  type: string;
  price: number;
  is_active: boolean;
  ebay_listed: boolean;
  image_url?: string | null;
};

type Meta = {
  total?: number;
  current_page?: number;
  last_page?: number;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function EbayStatusCard({ listedCount, totalCount }: { listedCount: number; totalCount: number }) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500">
          <ShoppingBag size={20} strokeWidth={1.8} className="text-white" />
        </div>
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#5c5e62]">
            Listed on eBay
          </p>
          <p className="mt-0.5 text-2xl font-extrabold text-[#1a1a1a]">{listedCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E85C1A]">
          <ShoppingBag size={20} strokeWidth={1.8} className="text-white" />
        </div>
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#5c5e62]">
            Unlisted Products
          </p>
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
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#5c5e62]">
            Total Products
          </p>
          <p className="mt-0.5 text-2xl font-extrabold text-[#1a1a1a]">{totalCount}</p>
        </div>
      </div>
    </div>
  );
}

function EbayBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[0.68rem] font-bold text-green-700">
      <ShoppingBag size={10} strokeWidth={2.5} />
      eBay Live
    </span>
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
  const [, startTransition] = useTransition();

  // ── Fetch products ──────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (opts?: { q?: string; filter?: string; page?: number }) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    const qVal = opts?.q !== undefined ? opts.q : q;
    const filterVal = opts?.filter !== undefined ? opts.filter : filter;
    const pageVal = opts?.page !== undefined ? opts.page : page;
    if (qVal.trim()) params.set("q", qVal.trim());
    if (filterVal === "listed") params.set("ebay_listed", "1");
    if (filterVal === "unlisted") params.set("ebay_listed", "0");
    params.set("per_page", "25");
    params.set("page", String(pageVal));

    try {
      const res = await fetch(`/api/admin/products?${params}`);
      if (res.status === 401) { setError("Session expired. Please log in again."); return; }
      const json = await res.json();
      setProducts(Array.isArray(json.data) ? json.data : []);
      setMeta(json.meta ?? {});
    } catch {
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Per-product eBay toggle ─────────────────────────────────────────────────

  const toggleEbay = async (product: Product) => {
    setActionError(null);
    const endpoint = product.ebay_listed
      ? `/api/admin/products/${product.id}/ebay/remove`
      : `/api/admin/products/${product.id}/ebay/list`;
    const method = product.ebay_listed ? "DELETE" : "POST";
    try {
      const res = await fetch(endpoint, { method });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(json.message || "eBay action failed.");
        return;
      }
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, ebay_listed: !p.ebay_listed } : p)
      );
    } catch {
      setActionError("Network error.");
    }
  };

  // ── Bulk list ───────────────────────────────────────────────────────────────

  const handleBulkList = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkProgress({ done: 0, total: ids.length });
    setActionError(null);
    startTransition(async () => {
      let done = 0;
      for (const id of ids) {
        try {
          await fetch(`/api/admin/products/${id}/ebay/list`, { method: "POST" });
        } catch { /* ignore per-item errors */ }
        done++;
        setBulkProgress({ done, total: ids.length });
      }
      setBulkProgress(null);
      setSelected(new Set());
      fetchProducts();
    });
  };

  // ── Selection helpers ───────────────────────────────────────────────────────

  const unlistedProducts = products.filter((p) => !p.ebay_listed);
  const allUnlistedSelected =
    unlistedProducts.length > 0 && unlistedProducts.every((p) => selected.has(p.id));

  const toggleSelectAll = () => {
    if (allUnlistedSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(unlistedProducts.map((p) => p.id)));
    }
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
  const totalCount = meta.total ?? products.length;
  const lastPage = meta.last_page ?? 1;

  const handleFilterChange = (val: "all" | "listed" | "unlisted") => {
    setFilter(val);
    setPage(1);
    setSelected(new Set());
    fetchProducts({ filter: val, page: 1 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts({ page: 1 });
  };

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
            Sales Channels
          </p>
          <p className="mt-1 text-[0.875rem] text-[#5c5e62]">
            Manage which products are listed on eBay.
          </p>
        </div>
        <a
          href="https://www.ebay.com/sh/ovw"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-black/[0.09] bg-white px-3.5 py-2 text-[0.8rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5]"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Open eBay Seller Hub
        </a>
      </div>

      {/* Stat cards */}
      <EbayStatusCard listedCount={listedCount} totalCount={totalCount} />

      {/* Error banners */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.83rem] text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}
      {actionError && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.83rem] text-red-700">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-[0.83rem] font-semibold text-green-800">
            {selected.size} product{selected.size > 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-3">
            {bulkProgress && (
              <p className="text-[0.78rem] text-green-700">
                Listing {bulkProgress.done}/{bulkProgress.total}…
              </p>
            )}
            <button
              type="button"
              onClick={handleBulkList}
              disabled={!!bulkProgress}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-1.5 text-[0.8rem] font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {bulkProgress ? <Loader2 size={13} className="animate-spin" /> : <ShoppingBag size={13} strokeWidth={2} />}
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
            onClick={() => fetchProducts()}
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
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                <th className="px-4 py-3">
                  <button type="button" onClick={toggleSelectAll} className="text-[#5c5e62] hover:text-[#1a1a1a]">
                    {allUnlistedSelected ? (
                      <CheckSquare size={15} strokeWidth={2} className="text-[#E85C1A]" />
                    ) : (
                      <Square size={15} strokeWidth={1.8} />
                    )}
                  </button>
                </th>
                {["SKU / Name", "Brand", "Type", "Size", "Price", "eBay Status", "Action"].map((h) => (
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
                products.map((product) => (
                  <tr key={product.id} className="group transition hover:bg-[#fafafa]">
                    <td className="px-4 py-3">
                      {!product.ebay_listed && (
                        <button
                          type="button"
                          onClick={() => toggleSelect(product.id)}
                          className="text-[#5c5e62] hover:text-[#E85C1A]"
                        >
                          {selected.has(product.id) ? (
                            <CheckSquare size={15} strokeWidth={2} className="text-[#E85C1A]" />
                          ) : (
                            <Square size={15} strokeWidth={1.8} />
                          )}
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-[0.82rem] font-extrabold text-[#1a1a1a]">{product.name}</p>
                      <p className="text-[0.73rem] font-mono text-[#5c5e62]">{product.sku}</p>
                    </td>

                    <td className="px-4 py-3 text-[0.875rem] text-[#1a1a1a]">{product.brand}</td>

                    <td className="px-4 py-3 text-[0.875rem] text-[#5c5e62]">{product.type}</td>

                    <td className="px-4 py-3 text-[0.875rem] text-[#5c5e62]">{product.size}</td>

                    <td className="px-4 py-3 text-[0.875rem] font-semibold text-[#1a1a1a]">
                      €{Number(product.price).toFixed(2)}
                    </td>

                    <td className="px-4 py-3">
                      {product.ebay_listed ? (
                        <EbayBadge />
                      ) : (
                        <span className="text-[0.72rem] text-[#aaa]">Not listed</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleEbay(product)}
                        className={[
                          "h-8 rounded-lg px-3 text-[0.78rem] font-semibold transition",
                          product.ebay_listed
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100",
                        ].join(" ")}
                      >
                        {product.ebay_listed ? "Remove" : "List on eBay"}
                      </button>
                    </td>
                  </tr>
                ))
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
                onClick={() => { setPage(page - 1); fetchProducts({ page: page - 1 }); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.09] bg-white text-[#1a1a1a] transition hover:border-[#E85C1A] hover:text-[#E85C1A] disabled:pointer-events-none disabled:bg-[#f5f5f5] disabled:text-[#ccc]"
              >
                ‹
              </button>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => { setPage(page + 1); fetchProducts({ page: page + 1 }); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.09] bg-white text-[#1a1a1a] transition hover:border-[#E85C1A] hover:text-[#E85C1A] disabled:pointer-events-none disabled:bg-[#f5f5f5] disabled:text-[#ccc]"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
