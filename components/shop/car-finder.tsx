"use client";

import { useState } from "react";
import { Car, Ruler, Search, Loader2, AlertCircle, ChevronDown, Fuel, Gauge } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CarInfo {
  make:             string;
  model:            string;
  year:             number;
  class:            string | null;
  drive:            string | null;
  fuel_type:        string | null;
  cylinders:        number | null;
  displacement:     number | null;
  transmission:     string | null;
  combination_mpg:  number | null;
}

interface FinderResponse {
  car:             CarInfo | null;
  vehicle_class:   string | null;
  suggested_sizes: string[];
  message:         string;
  error?:          string;
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  onSizeSelect: (size: string) => void;
};

type Tab = "car" | "size";

const inp =
  "h-11 min-w-0 flex-1 rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 text-[0.88rem] text-[#171a20] outline-none placeholder:text-[#9ca3af] transition focus:border-[#f4511e] focus:bg-white focus:ring-1 focus:ring-[#f4511e]/20";

function CarBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-[#fafafa] px-3 py-1 text-[0.75rem] text-[#5c5e62]">
      <span className="font-semibold text-[#171a20]">{label}</span>
      {value}
    </span>
  );
}

export default function CarFinder({ onSizeSelect }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("car");
  const [make,  setMake]  = useState("");
  const [model, setModel] = useState("");
  const [year,  setYear]  = useState("");

  const [isLoading,   setIsLoading]   = useState(false);
  const [result,      setResult]      = useState<FinderResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Scroll helpers ──────────────────────────────────────────────────────────

  const scrollToCatalogue = () => {
    document
      .getElementById("shop-catalogue")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim() || !year) return;

    setIsLoading(true);
    setHasSearched(true);
    setResult(null);

    try {
      const res = await fetch("/api/shop/car-finder", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ make: make.trim(), model: model.trim(), year: Number(year) }),
      });

      const json = (await res.json()) as FinderResponse;
      setResult(json);
    } catch {
      setResult({
        car:             null,
        vehicle_class:   null,
        suggested_sizes: [],
        message:         "No tyre data found for this vehicle. Try searching by size below.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Size badge click ────────────────────────────────────────────────────────

  const handleSizeClick = (size: string) => {
    onSizeSelect(size);
    scrollToCatalogue();
  };

  // ── Derived display helpers ─────────────────────────────────────────────────

  const noResults =
    result && (result.suggested_sizes.length === 0 || result.car === null);

  const tabCls = (tab: Tab) =>
    `flex items-center gap-2 px-6 py-4 text-sm font-semibold transition border-b-2 -mb-px ${
      activeTab === tab
        ? "border-[#f4511e] text-[#f4511e]"
        : "border-transparent text-[#5c5e62] hover:text-[#171a20]"
    }`;

  const capitalize = (s: string | null) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-[#f5f5f5] pb-0 pt-8">
      <div className="tesla-shell">
        <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">

          {/* ── Tab header ── */}
          <div className="flex border-b border-[#f0f0f0]">
            <button type="button" onClick={() => setActiveTab("car")} className={tabCls("car")}>
              <Car size={15} />
              Search by Car
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("size"); scrollToCatalogue(); }}
              className={tabCls("size")}
            >
              <Ruler size={15} />
              Search by Size
            </button>
          </div>

          {/* ── Search by Car ── */}
          {activeTab === "car" && (
            <div className="px-5 py-5">

              {/* Form row */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:flex-nowrap"
              >
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Make  e.g. Toyota"
                  autoComplete="off"
                  required
                  className={inp}
                />
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Model  e.g. Camry"
                  autoComplete="off"
                  required
                  className={inp}
                />
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Year  e.g. 2020"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  required
                  className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 text-[0.88rem] text-[#171a20] outline-none placeholder:text-[#9ca3af] transition focus:border-[#f4511e] focus:bg-white focus:ring-1 focus:ring-[#f4511e]/20 sm:w-40 md:w-36 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !make.trim() || !model.trim() || !year}
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
                <div className="mt-4 space-y-4">

                  {/* Error / no data */}
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
                      {/* Car summary strip */}
                      {result.car && (
                        <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-4 py-3">
                          <p className="mb-2 text-[0.82rem] font-semibold text-[#171a20]">
                            {result.car.year} {capitalize(result.car.make)}{" "}
                            {capitalize(result.car.model)}
                            {result.car.class && (
                              <span className="ml-2 font-normal text-[#5c5e62]">
                                · {capitalize(result.car.class)}
                              </span>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.car.fuel_type && (
                              <CarBadge
                                label=""
                                value={`${capitalize(result.car.fuel_type) ?? ""}`}
                              />
                            )}
                            {result.car.drive && (
                              <CarBadge label="Drive" value={result.car.drive.toUpperCase()} />
                            )}
                            {result.car.cylinders && (
                              <CarBadge label="" value={`${result.car.cylinders} cyl`} />
                            )}
                            {result.car.displacement && (
                              <CarBadge label="" value={`${result.car.displacement}L`} />
                            )}
                            {result.car.combination_mpg ? (
                              <span className="flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-[#fafafa] px-3 py-1 text-[0.75rem] text-[#5c5e62]">
                                <Fuel size={11} className="text-[#9ca3af]" />
                                <span className="font-semibold text-[#171a20]">
                                  {result.car.combination_mpg}
                                </span>{" "}
                                mpg
                              </span>
                            ) : null}
                            {result.car.transmission && (
                              <CarBadge
                                label=""
                                value={capitalize(result.car.transmission) ?? ""}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Size badges */}
                      <div>
                        <p className="mb-2.5 flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#5c5e62]">
                          <Gauge size={14} className="text-[#9ca3af]" />
                          {result.message} — click a size to search:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.suggested_sizes.map((size) => (
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
