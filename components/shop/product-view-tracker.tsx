"use client";

/**
 * components/shop/product-view-tracker.tsx
 *
 * Headless client component that fires a GA4 view_item event when a
 * product detail page mounts. The parent (app/shop/[id]/page.tsx) is a
 * server component, so this thin wrapper handles the browser-side tracking.
 */

import { useEffect } from "react";
import { trackProductView } from "@/lib/analytics";

type Props = {
  product: {
    id: number;
    brand: string;
    name: string;
    size: string;
    price: number;
    type: string;
  };
};

export default function ProductViewTracker({ product }: Props) {
  useEffect(() => {
    trackProductView(product);
    // Only re-fire if the product id changes (e.g. client-side navigation between products)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return null;
}
