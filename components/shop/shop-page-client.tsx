"use client";

import { useState } from "react";
import CarFinder from "@/components/shop/car-finder";
import ShopCatalogue from "@/components/shop/shop-catalogue";

export default function ShopPageClient({
  initialFilters,
}: {
  initialFilters?: Record<string, string>;
}) {
  const [prefilledSize, setPrefilledSize] = useState("");

  return (
    <>
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
