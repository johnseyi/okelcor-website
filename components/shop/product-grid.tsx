"use client";

import { ArrowUpDown } from "lucide-react";
import ProductCard, { type Product } from "./product-card";

type Props = {
  products: Product[];
  total: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
};

export default function ProductGrid({ products, total, sortBy, onSortChange }: Props) {
  return (
    <div>
      {/* Sort bar */}
      <div className="mb-5 flex items-center justify-between">
        <p className="hidden text-[0.9rem] text-[var(--muted)] md:block">
          <span className="font-semibold text-[var(--foreground)]">{total}</span>{" "}
          {total === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-[var(--muted)]" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[0.85rem] font-medium text-[var(--foreground)] outline-none transition hover:border-black/20"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid or empty state */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[22px] bg-[#efefef] py-20 text-center">
          <p className="text-xl font-extrabold text-[var(--foreground)]">
            No products found
          </p>
          <p className="mt-2 text-[0.95rem] text-[var(--muted)]">
            Try adjusting or clearing your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
