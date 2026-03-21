"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import FilterSidebar, { type FilterState } from "./filter-sidebar";
import ProductGrid from "./product-grid";
import { ALL_PRODUCTS } from "./data";

export default function ShopCatalogue() {
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    brands: [],
    seasons: [],
  });
  const [sortBy, setSortBy] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = ALL_PRODUCTS;
    if (filters.types.length > 0)
      result = result.filter((p) => filters.types.includes(p.type));
    if (filters.brands.length > 0)
      result = result.filter((p) => filters.brands.includes(p.brand));
    if (filters.seasons.length > 0)
      result = result.filter((p) => filters.seasons.includes(p.season));

    if (sortBy === "price-asc") return [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [filters, sortBy]);

  const activeFilterCount =
    filters.types.length + filters.brands.length + filters.seasons.length;

  return (
    <section className="w-full bg-[#f5f5f5] py-8 md:py-10">
      <div className="tesla-shell">
        {/* Mobile filter toggle */}
        <div className="mb-5 flex items-center justify-between md:hidden">
          <p className="text-[0.9rem] text-[var(--muted)]">
            <span className="font-semibold text-[var(--foreground)]">
              {filtered.length}
            </span>{" "}
            products
          </p>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex h-[38px] items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[0.88rem] font-semibold text-[var(--foreground)] transition hover:border-black/20"
          >
            <SlidersHorizontal size={15} />
            Filters
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
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] transition hover:bg-black/10"
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
              Show {filtered.length} results
            </button>
          </div>
        </>
      )}
    </section>
  );
}
