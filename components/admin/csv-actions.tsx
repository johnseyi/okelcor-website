"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ImportResult = {
  imported: number;
  updated:  number;
  skipped:  number;
  errors:   { row: number; message: string }[];
};

type ModalState =
  | { phase: "idle" }
  | { phase: "picking" }
  | { phase: "uploading" }
  | { phase: "done"; result: ImportResult }
  | { phase: "error"; message: string };

// ── Shared button styles ───────────────────────────────────────────────────────

const outlineBtnCls =
  "flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-[0.875rem] font-semibold text-[#5c5e62] transition hover:border-black/20 hover:text-[#171a20] disabled:opacity-50 disabled:cursor-not-allowed";

// ─────────────────────────────────────────────────────────────────────────────

export default function CsvActions() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting]   = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [modal, setModal]           = useState<ModalState>({ phase: "idle" });

  // ── Export ──────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);

    try {
      const res = await fetch("/api/admin/products/export");

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setExportError(json.error ?? `Export failed (HTTP ${res.status}).`);
        return;
      }

      // Create an object URL from the blob and click a hidden anchor to download
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");

      // Use the filename from Content-Disposition if present, else a default
      const disposition = res.headers.get("content-disposition") ?? "";
      const match       = disposition.match(/filename="?([^";\n]+)"?/i);
      a.download = match?.[1] ?? `products-${new Date().toISOString().slice(0, 10)}.csv`;
      a.href     = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Network error — could not reach the server.");
    } finally {
      setExporting(false);
    }
  };

  // ── Import ──────────────────────────────────────────────────────────────────

  const openModal  = () => setModal({ phase: "picking" });
  const closeModal = () => {
    setModal({ phase: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setModal({ phase: "uploading" });

    const form = new FormData();
    form.append("file", file);

    try {
      const res  = await fetch("/api/admin/products/import", {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => ({
        error: "Server returned an unreadable response.",
      }));

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        setModal({
          phase: "error",
          message: json.error ?? json.message ?? `Import failed (HTTP ${res.status}).`,
        });
        return;
      }

      setModal({ phase: "done", result: json as ImportResult });
      router.refresh(); // Refresh the server-rendered products table
    } catch {
      setModal({ phase: "error", message: "Network error — could not reach the server." });
    }
  };

  const selectedFile = fileInputRef.current?.files?.[0];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Buttons ── */}
      <div className="flex items-center gap-2">
        {/* Export error inline */}
        {exportError && (
          <span className="text-[0.78rem] font-medium text-red-500">{exportError}</span>
        )}

        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className={outlineBtnCls}
          aria-label="Export products as CSV"
        >
          {exporting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Download size={15} strokeWidth={2} />
          )}
          Export CSV
        </button>

        <button
          type="button"
          onClick={openModal}
          className={outlineBtnCls}
          aria-label="Import products from CSV"
        >
          <Upload size={15} strokeWidth={2} />
          Import CSV
        </button>
      </div>

      {/* ── Import modal ── */}
      {modal.phase !== "idle" && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            aria-hidden="true"
            onClick={closeModal}
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Import products CSV"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white p-7 shadow-[0_24px_64px_rgba(0,0,0,0.18)]"
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
                  Products
                </p>
                <h2 className="mt-0.5 text-[1.1rem] font-extrabold text-[#171a20]">
                  Import CSV
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1.5 text-[#5c5e62] transition hover:bg-black/[0.05] hover:text-[#171a20]"
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {/* ── Phase: picking / uploading ── */}
            {(modal.phase === "picking" || modal.phase === "uploading") && (
              <div className="flex flex-col gap-5">
                {/* File picker */}
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-[14px] border-2 border-dashed border-black/[0.12] bg-[#f5f5f5] px-6 py-8 text-center transition hover:border-[#E85C1A]/40 hover:bg-[#fff7f5]">
                  <Upload size={28} strokeWidth={1.5} className="text-[#E85C1A]" />
                  <div>
                    <p className="text-[0.9rem] font-semibold text-[#171a20]">
                      {selectedFile ? selectedFile.name : "Choose a CSV file"}
                    </p>
                    <p className="mt-0.5 text-[0.78rem] text-[#5c5e62]">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                        : "Click to browse or drag and drop"}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={() => setModal({ phase: "picking" })} // re-render to show filename
                  />
                </label>

                <p className="text-[0.78rem] text-[#5c5e62]">
                  Required columns: <code className="rounded bg-black/[0.06] px-1 py-0.5 font-mono text-[0.75rem]">brand</code>, <code className="rounded bg-black/[0.06] px-1 py-0.5 font-mono text-[0.75rem]">name</code>, <code className="rounded bg-black/[0.06] px-1 py-0.5 font-mono text-[0.75rem]">size</code>, <code className="rounded bg-black/[0.06] px-1 py-0.5 font-mono text-[0.75rem]">price</code>, <code className="rounded bg-black/[0.06] px-1 py-0.5 font-mono text-[0.75rem]">type</code>, <code className="rounded bg-black/[0.06] px-1 py-0.5 font-mono text-[0.75rem]">sku</code>. Rows with a matching SKU will be updated.
                </p>
                <p className="text-[0.78rem] font-medium text-amber-600">
                  ⚠ Newly imported products are set to <strong>Inactive</strong> by default. After import, go to the products list and toggle each one to <strong>Active</strong> so they appear on the shop.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={modal.phase === "uploading" || !fileInputRef.current?.files?.[0]}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#E85C1A] py-3 text-[0.9rem] font-semibold text-white transition hover:bg-[#d14f14] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {modal.phase === "uploading" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload size={15} strokeWidth={2} />
                        Upload and Import
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={modal.phase === "uploading"}
                    className="rounded-full border border-black/10 px-5 py-3 text-[0.9rem] font-semibold text-[#5c5e62] transition hover:bg-black/[0.04] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── Phase: done ── */}
            {modal.phase === "done" && (
              <div className="flex flex-col gap-5">
                {/* Summary */}
                <div className="flex items-start gap-3 rounded-[12px] border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-[0.9rem] font-semibold text-emerald-800">Import complete</p>
                    <p className="mt-1 text-[0.82rem] text-emerald-700">
                      <strong>{modal.result.imported}</strong> imported ·{" "}
                      <strong>{modal.result.updated}</strong> updated ·{" "}
                      <strong>{modal.result.skipped}</strong> skipped
                    </p>
                  </div>
                </div>

                {/* Row errors */}
                {modal.result.errors.length > 0 && (
                  <div>
                    <p className="mb-2 text-[0.78rem] font-bold uppercase tracking-wide text-red-600">
                      {modal.result.errors.length} row{modal.result.errors.length !== 1 ? "s" : ""} failed
                    </p>
                    <ul className="max-h-[180px] overflow-y-auto rounded-[10px] border border-red-100 bg-red-50 divide-y divide-red-100">
                      {modal.result.errors.map((e, i) => (
                        <li key={i} className="flex items-start gap-2 px-3 py-2">
                          <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500" />
                          <span className="text-[0.78rem] text-red-700">
                            <span className="font-semibold">Row {e.row}:</span> {e.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-full bg-[#171a20] py-3 text-[0.9rem] font-semibold text-white transition hover:bg-black"
                >
                  Done
                </button>
              </div>
            )}

            {/* ── Phase: error ── */}
            {modal.phase === "error" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3 rounded-[12px] border border-red-200 bg-red-50 p-4">
                  <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-[0.9rem] font-semibold text-red-800">Import failed</p>
                    <p className="mt-1 text-[0.82rem] text-red-700">{modal.message}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModal({ phase: "picking" })}
                    className="flex-1 rounded-full bg-[#E85C1A] py-3 text-[0.9rem] font-semibold text-white transition hover:bg-[#d14f14]"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-black/10 px-5 py-3 text-[0.9rem] font-semibold text-[#5c5e62] transition hover:bg-black/[0.04]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
