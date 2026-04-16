"use client";

import { useMemo, useState } from "react";
import {
  Search, SlidersHorizontal, X,
  Sun, Snowflake, Layers,
  Car, Truck, Mountain, RotateCcw,
} from "lucide-react";
import FilterSidebar, { type FilterState } from "./filter-sidebar";
import ProductGrid from "./product-grid";
import { ALL_PRODUCTS, type Product } from "./data";
import { useLanguage } from "@/context/language-context";

// ── Discovery data ─────────────────────────────────────────────────────────────

const POPULAR_BRANDS = [
  "Michelin", "Bridgestone", "Continental", "Goodyear",
  "Pirelli", "Dunlop", "Hankook", "Falken",
];

const SEASONS = [
  { label: "Summer Tyres",    value: "Summer",     icon: Sun,       desc: "High performance in warm conditions" },
  { label: "Winter Tyres",    value: "Winter",     icon: Snowflake, desc: "Grip and safety in cold weather" },
  { label: "All Season",      value: "All Season", icon: Layers,    desc: "Year-round versatility" },
];

const TYPES = [
  { label: "PCR",  value: "PCR",  icon: Car,       desc: "Passenger car radial" },
  { label: "TBR",  value: "TBR",  icon: Truck,     desc: "Truck & bus radial" },
  { label: "OTR",  value: "OTR",  icon: Mountain,  desc: "Off-the-road" },
  { label: "Used", value: "Used", icon: RotateCcw, desc: "Premium used tyres" },
];

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  /** Live products from the API — falls back to static ALL_PRODUCTS when empty/unavailable */
  products?: Product[];
};

export default function ShopCatalogue({ products: apiProducts }: Props) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    brands: [],
    seasons: [],
  });
  const [sortBy, setSortBy] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount =
    filters.types.length + filters.brands.length + filters.seasons.length;

  const hasSearched = searchQuery.trim().length > 0 || activeFilterCount > 0;

  // Use whatever the API returned (even an empty array).
  // Fall back to ALL_PRODUCTS only when the prop was never provided (undefined),
  // which can only happen outside of the normal shop page flow.
  const allProducts = apiProducts !== undefined ? apiProducts : ALL_PRODUCTS;

  const filtered = useMemo(() => {
    if (!hasSearched) return [];

    let result = allProducts;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.brand?.toLowerCase().includes(q) ||
          p.name?.toLowerCase().includes(q) ||
          p.size?.toLowerCase().includes(q) ||
          p.type?.toLowerCase().includes(q)
      );
    }

    if (filters.types.length > 0)
      result = result.filter((p) => filters.types.includes(p.type));
    if (filters.brands.length > 0)
      result = result.filter((p) => filters.brands.includes(p.brand));
    if (filters.seasons.length > 0)
      result = result.filter((p) => filters.seasons.includes(p.season));

    if (sortBy === "price-asc") return [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [searchQuery, filters, sortBy, hasSearched, allProducts]);

  // ── Discovery helpers ────────────────────────────────────────────────────────

  const selectBrand = (brand: string) => setSearchQuery(brand);

  const selectSeason = (season: string) =>
    setFilters((f) => ({ ...f, seasons: [season] }));

  const selectType = (type: string) =>
    setFilters((f) => ({ ...f, types: [type] }));

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <section className="w-full bg-[#f5f5f5] py-8 md:py-10">
      <div className="tesla-shell">

        {/* ── Search bar ── */}
        <div className="mb-8">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5c5e62]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand, size or tyre type…"
              className="w-full rounded-full border border-black/10 bg-white py-3.5 pl-11 pr-5 text-[0.93rem] text-[#171a20] placeholder-[#9ca3af] shadow-sm outline-none transition focus:border-[#f4511e]/40 focus:ring-2 focus:ring-[#f4511e]/10"
            />
          </div>
        </div>

        {/* ── Discovery state ── */}
        {!hasSearched && (
          <div className="space-y-10">

            {/* Popular Brands */}
            <div>
              <h3 className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#5c5e62]">
                Popular Brands
              </h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_BRANDS.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => selectBrand(brand)}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 text-[0.88rem] font-semibold text-[#171a20] transition hover:border-[#f4511e]/40 hover:bg-[#f4511e]/[0.04] hover:text-[#f4511e]"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse by Season */}
            <div>
              <h3 className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#5c5e62]">
                Browse by Season
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {SEASONS.map(({ label, value, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectSeason(value)}
                    className="group flex flex-col items-start gap-3 rounded-[16px] border border-black/[0.07] bg-white p-5 text-left transition hover:border-[#f4511e]/30 hover:shadow-sm"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] transition group-hover:bg-[#f4511e]/10">
                      <Icon size={18} strokeWidth={1.8} className="text-[#5c5e62] transition group-hover:text-[#f4511e]" />
                    </span>
                    <div>
                      <p className="text-[0.93rem] font-extrabold text-[#171a20]">{label}</p>
                      <p className="mt-0.5 text-[0.78rem] text-[#5c5e62]">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Browse by Type */}
            <div>
              <h3 className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#5c5e62]">
                Browse by Type
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TYPES.map(({ label, value, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectType(value)}
                    className="group flex flex-col items-start gap-3 rounded-[16px] border border-black/[0.07] bg-white p-5 text-left transition hover:border-[#f4511e]/30 hover:shadow-sm"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] transition group-hover:bg-[#f4511e]/10">
                      <Icon size={18} strokeWidth={1.8} className="text-[#5c5e62] transition group-hover:text-[#f4511e]" />
                    </span>
                    <div>
                      <p className="text-[0.93rem] font-extrabold text-[#171a20]">{label}</p>
                      <p className="mt-0.5 text-[0.78rem] text-[#5c5e62]">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── Results state ── */}
        {hasSearched && (
          <>
            {/* Mobile filter toggle */}
            <div className="mb-5 flex items-center justify-between md:hidden">
              <p className="text-[0.9rem] text-[var(--muted)]">
                <span className="font-semibold text-[var(--foreground)]">
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1 ? t.shop.catalogue.product : t.shop.catalogue.products}
              </p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex h-[48px] items-center gap-2 rounded-full border border-black/10 bg-white px-5 text-[0.88rem] font-semibold text-[var(--foreground)] transition hover:border-black/20"
              >
                <SlidersHorizontal size={15} />
                {t.shop.catalogue.filtersBtn}
                {activeFilterCount > 0 && (
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop: sidebar + grid */}
            <div className="flex gap-7">
              <aside className="hidden shrink-0 md:block" style={{ width: "260px" }}>
                <div className="sticky top-[96px]">
                  <FilterSidebar filters={filters} onChange={setFilters} />
                </div>
              </aside>
              <div className="min-w-0 flex-1">
                <ProductGrid
                  products={filtered}
                  total={filtered.length}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              </div>
            </div>
          </>
        )}

      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[82vh] overflow-y-auto rounded-t-[24px] bg-[#f5f5f5] p-5 pb-8 shadow-[0_-8px_40px_rgba(0,0,0,0.14)] md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[1.05rem] font-extrabold text-[var(--foreground)]">
                {t.shop.catalogue.filtersHeading}
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.06] transition hover:bg-black/10"
                aria-label="Close filters"
              >
                <X size={17} />
              </button>
            </div>
            <FilterSidebar filters={filters} onChange={setFilters} />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-5 w-full rounded-full bg-[var(--primary)] py-3 text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              {t.shop.catalogue.show} {filtered.length} {t.shop.catalogue.results}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
