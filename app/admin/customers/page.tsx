"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, Search, ChevronLeft, ChevronRight,
  FileText, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Customer = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_type: "b2b" | "b2c";
  company_name?: string;
  country?: string;
  phone?: string;
  created_at: string;
  source?: string;
};

type ImportResult = {
  imported: number;
  skipped_no_email: number;
  skipped_duplicate: number;
  b2b: number;
  b2c: number;
  errors?: { row: number; message: string }[];
};

type FilterTab = "all" | "b2b" | "b2c" | "wix";

const PER_PAGE = 50;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function fullName(c: Customer): string {
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || "—";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: "b2b" | "b2c" }) {
  return type === "b2b" ? (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[0.7rem] font-bold text-blue-700">
      Business
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[0.7rem] font-bold text-gray-500">
      Individual
    </span>
  );
}

function WixTag() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[0.63rem] font-bold text-violet-600">
      Wix
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CustomersPage() {

  // ── Import state ─────────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile]               = useState<File | null>(null);
  const [importing, setImporting]     = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // ── Table state ──────────────────────────────────────────────────────────
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [tab, setTab]               = useState<FilterTab>("all");
  const [search, setSearch]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading]       = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filter/search changes
  useEffect(() => { setPage(1); }, [tab, debouncedSearch]);

  // ── Fetch customers ───────────────────────────────────────────────────────

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setTableError(null);

    const params = new URLSearchParams({
      per_page: String(PER_PAGE),
      page: String(page),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (tab === "b2b")  params.set("customer_type", "b2b");
    if (tab === "b2c")  params.set("customer_type", "b2c");
    if (tab === "wix")  params.set("source", "wix");

    try {
      // Proxy reads the httpOnly admin_token cookie server-side
      const res = await fetch(`/api/admin/customers?${params}`, { cache: "no-store" });
      const json = await res.json();
      console.log("[Customers] API response:", json);
      if (!res.ok) {
        setTableError(json.error ?? `Error ${res.status} loading customers.`);
        return;
      }
      setCustomers(Array.isArray(json.data) ? json.data : []);
      setTotal(json.meta?.total ?? 0);
    } catch (err) {
      console.error("[Customers] fetch error:", err);
      setTableError("Could not load customers. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [page, tab, debouncedSearch]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Import handler ────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/customers/import", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setImportError(json.error ?? json.message ?? "Import failed.");
      } else {
        // API wraps counts in json.data
        setImportResult(json.data ?? json);
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
        fetchCustomers();
      }
    } catch {
      setImportError("Network error. Could not reach the import service.");
    } finally {
      setImporting(false);
    }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all",  label: "All" },
    { key: "b2b",  label: "B2B" },
    { key: "b2c",  label: "B2C" },
    { key: "wix",  label: "Wix Imports" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8">

      {/* Page header */}
      <div className="mb-7">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
          Customer Management
        </p>
        <p className="mt-1 text-[0.875rem] text-[#5c5e62]">
          Manage registered customers and import from Wix.
        </p>
      </div>

      {/* ── Import card ── */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E85C1A]">
            <FileText size={18} strokeWidth={1.8} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-[#1a1a1a]">Import Customers from Wix</p>
            <p className="mt-0.5 text-[0.83rem] text-[#5c5e62]">
              Upload a Wix contacts CSV to import customers. B2B and B2C accounts are detected automatically.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-black/[0.12] bg-[#fafafa] px-4 py-3 transition hover:border-[#E85C1A]/40 hover:bg-orange-50/30">
            <Upload size={16} className="shrink-0 text-[#5c5e62]" />
            <span className="truncate text-[0.875rem] text-[#5c5e62]">
              {file ? file.name : "Choose a .csv file…"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                setImportResult(null);
                setImportError(null);
              }}
            />
          </label>

          <button
            type="button"
            disabled={!file || importing}
            onClick={handleImport}
            className="flex h-[42px] items-center gap-2 rounded-full bg-[#E85C1A] px-6 text-[0.875rem] font-semibold text-white transition hover:bg-[#d44d10] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <Upload size={15} />
                Import Customers
              </>
            )}
          </button>
        </div>

        {/* Import error */}
        {importError && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={15} className="shrink-0 text-red-500" />
            <p className="text-[0.83rem] text-red-700">{importError}</p>
          </div>
        )}

        {/* Import results */}
        {importResult && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <p className="text-[0.875rem] font-semibold text-emerald-800">Import complete</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "Imported",             value: importResult.imported },
                { label: "Skipped (no email)",   value: importResult.skipped_no_email },
                { label: "Skipped (duplicate)",  value: importResult.skipped_duplicate },
                { label: "B2B accounts",         value: importResult.b2b },
                { label: "B2C accounts",         value: importResult.b2c },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-white px-3 py-2.5 text-center shadow-sm">
                  <p className="text-[1.15rem] font-extrabold text-[#1a1a1a]">{value}</p>
                  <p className="text-[0.7rem] text-[#5c5e62]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Customers table ── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        {/* Table header: search + filter tabs */}
        <div className="flex flex-col gap-3 border-b border-black/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-full px-3.5 py-1.5 text-[0.78rem] font-semibold transition ${
                  tab === key
                    ? "bg-[#E85C1A] text-white"
                    : "text-[#5c5e62] hover:bg-[#f0f2f5] hover:text-[#1a1a1a]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input
              type="search"
              placeholder="Search name, email or company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-black/[0.09] bg-[#fafafa] pl-9 pr-3.5 text-[0.83rem] text-[#1a1a1a] outline-none placeholder:text-[#aaa] transition focus:border-[#E85C1A] focus:ring-2 focus:ring-[#E85C1A]/10 sm:w-72"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#fafafa]">
                {["Name", "Email", "Type", "Company", "Country", "Phone", "Registered", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#5c5e62]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center">
                    <Loader2 size={20} className="mx-auto animate-spin text-[#E85C1A]" />
                  </td>
                </tr>
              ) : tableError ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-[0.875rem] text-red-500">
                    {tableError}
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-[0.875rem] text-[#5c5e62]">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <span className="text-[0.875rem] font-semibold text-[#1a1a1a]">
                        {fullName(c)}
                      </span>
                      {c.source === "wix" && <WixTag />}
                    </td>
                    <td className="px-5 py-3 text-[0.83rem] text-[#5c5e62]">
                      {c.email}
                    </td>
                    <td className="px-5 py-3">
                      <TypeBadge type={c.customer_type} />
                    </td>
                    <td className="px-5 py-3 text-[0.83rem] text-[#5c5e62]">
                      {c.company_name || "—"}
                    </td>
                    <td className="px-5 py-3 text-[0.83rem] text-[#5c5e62]">
                      {c.country || "—"}
                    </td>
                    <td className="px-5 py-3 text-[0.83rem] text-[#5c5e62]">
                      {c.phone || "—"}
                    </td>
                    <td className="px-5 py-3 text-[0.83rem] text-[#5c5e62]">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={`mailto:${c.email}`}
                        className="text-[0.78rem] font-semibold text-[#E85C1A] transition hover:underline"
                      >
                        Email
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/[0.05] px-5 py-3">
            <p className="text-[0.78rem] text-[#5c5e62]">
              {total} customer{total !== 1 ? "s" : ""}
              {" · "}page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-[#1a1a1a] transition hover:bg-[#f0f2f5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-[#1a1a1a] transition hover:bg-[#f0f2f5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
