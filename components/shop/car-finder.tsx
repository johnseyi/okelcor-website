"use client";

import { useState, useEffect } from "react";
import { Car, Ruler, Search, Loader2, AlertCircle, ChevronDown } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VehicleOption {
  slug: string;
  name: string;
}

interface FinderResponse {
  car:     { make: string; model: string; year: number } | null;
  sizes:   string[];
  message: string;
  error?:  string;
}

type Props = { onSizeSelect: (size: string) => void };
type Tab   = "car" | "size";

// ── Styles ────────────────────────────────────────────────────────────────────

const selectCls =
  "h-11 w-full appearance-none rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 pr-9 text-[0.88rem] text-[#171a20] outline-none transition focus:border-[#f4511e] focus:bg-white focus:ring-1 focus:ring-[#f4511e]/20 disabled:cursor-not-allowed disabled:opacity-50";

const yearCls =
  "h-11 w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 text-[0.88rem] text-[#171a20] outline-none placeholder:text-[#9ca3af] transition focus:border-[#f4511e] focus:bg-white focus:ring-1 focus:ring-[#f4511e]/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

// ── Shared select wrapper (adds the chevron icon) ─────────────────────────────

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1">
      {children}
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
      />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CarFinder({ onSizeSelect }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("car");

  // Dropdown data
  const [makes,        setMakes]        = useState<VehicleOption[]>([]);
  const [models,       setModels]       = useState<VehicleOption[]>([]);
  const [makesLoading, setMakesLoading] = useState(false);
  const [makesError,   setMakesError]   = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Form state
  const [make,  setMake]  = useState("");   // slug
  const [model, setModel] = useState("");   // slug
  const [year,  setYear]  = useState("");

  // Search state
  const [isLoading,   setIsLoading]   = useState(false);
  const [result,      setResult]      = useState<FinderResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Load makes on mount ─────────────────────────────────────────────────────

  useEffect(() => {
    setMakesLoading(true);
    setMakesError(false);
    fetch("/api/shop/makes")
      .then((r) => r.json())
      .then((json: { makes?: VehicleOption[]; error?: string }) => {
        if (json.makes) setMakes(json.makes);
        else setMakesError(true);
      })
      .catch(() => setMakesError(true))
      .finally(() => setMakesLoading(false));
  }, []);

  // ── Load models when make changes ───────────────────────────────────────────

  const handleMakeChange = (slug: string) => {
    setMake(slug);
    setModel("");
    setModels([]);
    setResult(null);
    setHasSearched(false);

    if (!slug) return;

    setModelsLoading(true);
    fetch(`/api/shop/models?make=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((json: { models?: VehicleOption[] }) => {
        setModels(json.models ?? []);
      })
      .catch(() => setModels([]))
      .finally(() => setModelsLoading(false));
  };

  const handleModelChange = (slug: string) => {
    setModel(slug);
    setResult(null);
    setHasSearched(false);
  };

  // ── Scroll helper ───────────────────────────────────────────────────────────

  const scrollToCatalogue = () =>
    document.getElementById("shop-catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !year) return;

    setIsLoading(true);
    setHasSearched(true);
    setResult(null);

    try {
      const res = await fetch("/api/shop/car-finder", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ make, model, year: Number(year) }),
      });
      const json = (await res.json()) as FinderResponse;
      setResult(json);
    } catch {
      setResult({ car: null, sizes: [], message: "Could not look up tyre data. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Size badge click ────────────────────────────────────────────────────────

  const handleSizeClick = (size: string) => {
    onSizeSelect(size);
    scrollToCatalogue();
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const noResults = result && (result.error || result.sizes.length === 0);

  const tabCls = (tab: Tab) =>
    `flex items-center gap-2 px-6 py-4 text-sm font-semibold transition border-b-2 -mb-px ${
      activeTab === tab
        ? "border-[#f4511e] text-[#f4511e]"
        : "border-transparent text-[#5c5e62] hover:text-[#171a20]"
    }`;

  const canSearch = !!make && !!model && !!year && !isLoading;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-[#f5f5f5] pb-0 pt-8">
      <div className="tesla-shell">
        <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">

          {/* Tabs */}
          <div className="flex border-b border-[#f0f0f0]">
            <button type="button" onClick={() => setActiveTab("car")} className={tabCls("car")}>
              <Car size={15} /> Search by Car
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("size"); scrollToCatalogue(); }}
              className={tabCls("size")}
            >
              <Ruler size={15} /> Search by Size
            </button>
          </div>

          {/* ── Search by Car ── */}
          {activeTab === "car" && (
            <div className="px-5 py-5">

              {/* Makes failed to load */}
              {makesError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#fde8e4] bg-[#fff8f7] px-4 py-3 text-[0.83rem] text-[#c0392b]">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  Vehicle data unavailable. Please try again later.
                </div>
              )}

              {/* Cascading dropdowns row */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:flex-nowrap"
              >
                {/* Make */}
                <SelectWrapper>
                  <select
                    value={make}
                    onChange={(e) => handleMakeChange(e.target.value)}
                    disabled={makesLoading || makesError}
                    className={selectCls}
                    aria-label="Vehicle make"
                  >
                    <option value="">
                      {makesLoading ? "Loading makes…" : "Select make"}
                    </option>
                    {makes.map((m) => (
                      <option key={m.slug} value={m.slug}>{m.name}</option>
                    ))}
                  </select>
                </SelectWrapper>

                {/* Model */}
                <SelectWrapper>
                  <select
                    value={model}
                    onChange={(e) => handleModelChange(e.target.value)}
                    disabled={!make || modelsLoading || models.length === 0}
                    className={selectCls}
                    aria-label="Vehicle model"
                  >
                    <option value="">
                      {!make
                        ? "Select make first"
                        : modelsLoading
                          ? "Loading models…"
                          : "Select model"}
                    </option>
                    {models.map((m) => (
                      <option key={m.slug} value={m.slug}>{m.name}</option>
                    ))}
                  </select>
                </SelectWrapper>

                {/* Year */}
                <input
                  type="number"
                  value={year}
                  onChange={(e) => { setYear(e.target.value); setResult(null); setHasSearched(false); }}
                  placeholder="Year"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  required
                  aria-label="Vehicle year"
                  className={`${yearCls} sm:w-32 md:w-28`}
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSearch}
                  className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#f4511e] px-6 text-[0.88rem] font-semibold text-white transition hover:bg-[#d14f14] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Search size={15} strokeWidth={2.2} />}
                  Find Tyres
                </button>
              </form>

              {/* Loading */}
              {isLoading && (
                <div className="mt-5 flex items-center justify-center py-6">
                  <Loader2 size={24} className="animate-spin text-[#9ca3af]" />
                </div>
              )}

              {/* Results */}
              {!isLoading && hasSearched && result && (
                <div className="mt-4 space-y-3">

                  {noResults ? (
                    <div className="flex items-start gap-2.5 rounded-xl border border-[#fde8e4] bg-[#fff8f7] px-4 py-3 text-[0.85rem] text-[#c0392b]">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>
                        {result.error ??
                          "No tyre data found for this vehicle. Try searching by size below."}
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Vehicle summary */}
                      {result.car && (
                        <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-4 py-2.5">
                          <p className="text-[0.85rem] font-semibold text-[#171a20]">
                            {result.car.year}{" "}
                            {result.car.make.charAt(0).toUpperCase() + result.car.make.slice(1)}{" "}
                            {result.car.model.charAt(0).toUpperCase() + result.car.model.slice(1)}
                          </p>
                        </div>
                      )}

                      {/* OE size badges */}
                      <div>
                        <p className="mb-2.5 text-[0.82rem] font-semibold text-[#5c5e62]">
                          {result.message} — click a size to search:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.sizes.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleSizeClick(size)}
                              className="rounded-full border border-[#f4511e]/30 bg-[#fff3ee] px-4 py-1.5 text-[0.82rem] font-semibold text-[#f4511e] transition hover:bg-[#f4511e] hover:text-white"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Search by Size ── */}
          {activeTab === "size" && (
            <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
              <p className="text-[0.9rem] text-[#5c5e62]">
                Use the size filters in the search bar below to find your tyres.
              </p>
              <button
                type="button"
                onClick={scrollToCatalogue}
                className="flex items-center gap-1 text-[0.85rem] font-semibold text-[#f4511e] transition hover:underline"
              >
                Go to filters <ChevronDown size={15} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
