"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import FilterSidebar, { type FilterState } from "./filter-sidebar";
import ProductGrid from "./product-grid";
import { ALL_PRODUCTS } from "./data";
import { useLanguage } from "@/context/language-context";

export default function ShopCatalogue() {
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

  const filtered = useMemo(() => {
    if (!hasSearched) return [];

    let result = ALL_PRODUCTS;

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
  }, [searchQuery, filters, sortBy, hasSearched]);

  return (
    <section className="w-full bg-[#f5f5f5] py-8 md:py-10">
      <div className="tesla-shell">

        {/* ── Search bar ── */}
        <div className="mb-6 md:mb-8">
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

        {/* Mobile filter toggle */}
        <div className="mb-5 flex items-center justify-between md:hidden">
          {hasSearched ? (
            <p className="text-[0.9rem] text-[var(--muted)]">
              <span className="font-semibold text-[var(--foreground)]">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? t.shop.catalogue.product : t.shop.catalogue.products}
            </p>
          ) : (
            <span />
          )}
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

        {/* Desktop: sidebar + content */}
        <div className="flex gap-7">
          <aside className="hidden shrink-0 md:block" style={{ width: "260px" }}>
            <div className="sticky top-[96px]">
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {hasSearched ? (
              <ProductGrid
                products={filtered}
                total={filtered.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                  <Search size={24} className="text-[#9ca3af]" />
                </div>
                <p className="text-[1rem] font-semibold text-[#171a20]">
                  Find your tyres
                </p>
                <p className="mt-1.5 max-w-[320px] text-[0.88rem] leading-6 text-[#5c5e62]">
                  Search by brand, size or tyre type to find products
                </p>
              </div>
            )}
          </div>
        </div>
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
              {hasSearched
                ? `${t.shop.catalogue.show} ${filtered.length} ${t.shop.catalogue.results}`
                : t.shop.catalogue.filtersBtn}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
