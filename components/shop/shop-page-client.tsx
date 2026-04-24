"use client";

import { useState } from "react";
import CarFinder from "@/components/shop/car-finder";
import ShopCatalogue from "@/components/shop/shop-catalogue";
import ShopPromoBanner, { type ShopPromotion } from "@/components/shop/shop-promo-banner";

export default function ShopPageClient({
  activePromo,
  initialFilters,
}: {
  activePromo?: ShopPromotion | null;
  initialFilters?: Record<string, string>;
}) {
  const [prefilledSize, setPrefilledSize] = useState("");

  return (
    <>
      {activePromo && <ShopPromoBanner promo={activePromo} />}
      <CarFinder onSizeSelect={setPrefilledSize} />
      <div id="shop-catalogue">
        <ShopCatalogue
          prefilledSize={prefilledSize}
          onPrefilledSizeConsumed={() => setPrefilledSize("")}
          initialFilters={initialFilters}
        />
      </div>
    </>
  );
}
