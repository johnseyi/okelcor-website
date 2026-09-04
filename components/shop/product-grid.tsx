"use client";

import { ArrowUpDown, LayoutGrid, Rows3 } from "lucide-react";
import ProductCard, { type Product, type ActiveCampaign } from "./product-card";
import ProductListRow from "./product-list-row";
import { useLanguage } from "@/context/language-context";

export type CatalogueView = "grid" | "list";

type Props = {
  products: Product[];
  total: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  view: CatalogueView;
  onViewChange: (view: CatalogueView) => void;
  customerType?: "b2b" | "b2c" | "guest";
  guestSegment?: "b2b" | "b2c";
  activeCampaign?: ActiveCampaign | null;
};

/** Same tier resolution the card uses, for the list rows. */
function resolveListPrice(p: Product, customerType?: "b2b" | "b2c" | "guest"): number {
  if (customerType === "b2b") return p.price_b2b ?? p.price;
  return p.price_b2c ?? p.price;
}

export default function ProductGrid({ products, total, sortBy, onSortChange, view, onViewChange, customerType, guestSegment, activeCampaign }: Props) {
  const { t } = useLanguage();

  const toggleBtn = (target: CatalogueView, Icon: typeof LayoutGrid, label: string) => (
    <button
      type="button"
      aria-pressed={view === target}
      title={label}
      onClick={() => onViewChange(target)}
      className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
        view === target
          ? "border-[#171a20] bg-[#171a20] text-white"
          : "border-black/15 bg-white text-[#5c5e62] hover:border-black/40"
      }`}
    >
      <Icon size={14} strokeWidth={2.2} aria-hidden />
    </button>
  );

  return (
    <div>
      {/* Results header: count, view toggle, sort */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[0.9rem] text-[#5c5e62]">
          <span className="font-semibold text-[#171a20]">{total}</span>{" "}
          {total === 1 ? t.shop.catalogue.product : t.shop.catalogue.products}
        </p>
        <div className="flex items-center gap-2">
          {/* The trade view. Heuver shows results as a dense table because a
              buyer comparing forty candidates scans a list, not a wall of
              cards. */}
          <div className="flex items-center gap-1" role="group" aria-label="Result layout">
            {toggleBtn("grid", LayoutGrid, "Grid view")}
            {toggleBtn("list", Rows3, "List view")}
          </div>
          <ArrowUpDown size={14} className="ml-1 text-[#8c8f94]" aria-hidden />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-8 cursor-pointer rounded-md border border-black/15 bg-white px-2 text-[0.82rem] font-medium text-[#171a20] outline-none transition-colors focus:border-[#f4511e]"
          >
            <option value="default">{t.shop.sort.default}</option>
            <option value="price-asc">{t.shop.sort.priceAsc}</option>
            <option value="price-desc">{t.shop.sort.priceDesc}</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-black/10 bg-white py-20 text-center">
          <p className="text-lg font-bold text-[#171a20]">{t.shop.grid.noProducts}</p>
          <p className="mt-2 text-[0.9rem] text-[#5c5e62]">{t.shop.grid.noProductsHint}</p>
        </div>
      ) : view === "list" ? (
        <div className="overflow-hidden rounded-lg border border-black/10">
          {products.map((product) => (
            <ProductListRow
              key={product.id}
              product={product}
              displayPrice={resolveListPrice(product, customerType)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 3} customerType={customerType} guestSegment={guestSegment} activeCampaign={activeCampaign} />
          ))}
        </div>
      )}
    </div>
  );
}
