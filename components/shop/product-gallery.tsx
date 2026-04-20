"use client";

import { useState } from "react";
import type { Product } from "./data";
import { getProductImageUrl } from "@/lib/utils";

const PLACEHOLDER = "/images/tyre-placeholder.png";

export default function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);

  const images = product.images.length ? product.images : [product.image].filter(Boolean) as string[];
  const mainUrl = getProductImageUrl(images[selected] ?? null);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-[#efefef]">
        <img
          src={mainUrl}
          alt={`${product.brand} ${product.name}`}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
          className="h-full w-full object-contain transition-opacity duration-300"
        />
        {/* Type badge */}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-[var(--foreground)] shadow-sm backdrop-blur-sm">
          {product.type}
        </span>
      </div>

      {/* Thumbnails — only show if more than one image */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => {
            const thumbUrl = getProductImageUrl(img);
            return (
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
                  src={thumbUrl}
                  alt={`Thumbnail ${i + 1}`}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
