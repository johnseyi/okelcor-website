"use client";

import { useState } from "react";
import CarFinder from "@/components/shop/car-finder";
import ShopCatalogue from "@/components/shop/shop-catalogue";

export default function ShopPageClient() {
  const [prefilledSize, setPrefilledSize] = useState("");

  return (
    <>
      <CarFinder onSizeSelect={setPrefilledSize} />
      <div id="shop-catalogue">
        <ShopCatalogue
          prefilledSize={prefilledSize}
          onPrefilledSizeConsumed={() => setPrefilledSize("")}
        />
      </div>
    </>
  );
}
