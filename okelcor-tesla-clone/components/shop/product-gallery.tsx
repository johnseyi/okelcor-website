"use client";

import { useState } from "react";
import type { Product } from "./data";

export default function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-[#efefef]">
        <img
          src={product.images[selected]}
          alt={`${product.brand} ${product.name}`}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
        {/* Type badge */}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-[var(--foreground)] shadow-sm backdrop-blur-sm">
          {product.type}
        </span>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3">
        {product.images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            aria-label={`View image ${i + 1}`}
            className={`relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[12px] border-2 transition-all sm:h-[88px] sm:w-[88px] ${
              selected === i
                ? "border-[var(--primary)]"
                : "border-transparent opacity-60 hover:opacity-90"
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
