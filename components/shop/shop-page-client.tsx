"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CarFinder from "@/components/shop/car-finder";
import ShopCatalogue from "@/components/shop/shop-catalogue";
import { SHOP_REQUIRES_LOGIN } from "@/lib/flags";

export default function ShopPageClient({
  initialFilters,
  noNavbarPad,
  source = "shop",
}: {
  initialFilters?: Record<string, string>;
  noNavbarPad?: boolean;
  source?: "shop" | "seo-landing";
}) {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const [prefilledSize, setPrefilledSize] = useState("");

  // Arriving with filters means the buyer already knows what they want; the
  // car finder folds away so the results are the first thing on screen.
  // Arriving bare, it stays open as the guided way in.
  const [carFinderOpen, setCarFinderOpen] = useState(
    !initialFilters || Object.keys(initialFilters).length === 0,
  );

  useEffect(() => {
    if (SHOP_REQUIRES_LOGIN && !isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/shop");
    }
  }, [isLoading, isAuthenticated, router]);

  // Block render only when login is required and auth hasn't resolved yet.
  if (SHOP_REQUIRES_LOGIN && (isLoading || !isAuthenticated)) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ paddingTop: "calc(var(--bar-h, 0px) + 76px)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#f0f0f0] border-t-[var(--primary)]" />
          <p className="text-[0.85rem] text-[var(--muted)]">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={noNavbarPad ? undefined : { paddingTop: "calc(var(--bar-h, 0px) + 76px)" }}>
      {carFinderOpen ? (
        <CarFinder onSizeSelect={setPrefilledSize} />
      ) : (
        <div className="tesla-shell pt-4">
          <button
            type="button"
            onClick={() => setCarFinderOpen(true)}
            className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-3 text-[0.88rem] font-semibold text-[#171a20] transition-colors hover:border-black/30"
          >
            <span className="flex items-center gap-2">
              <Car size={15} strokeWidth={2.2} className="text-[#f4511e]" aria-hidden />
              Not sure of the size? Search by car instead
            </span>
            <ChevronDown size={15} strokeWidth={2.2} className="text-[#8c8f94]" aria-hidden />
          </button>
        </div>
      )}
      <div id="shop-catalogue">
        <ShopCatalogue
          prefilledSize={prefilledSize}
          onPrefilledSizeConsumed={() => setPrefilledSize("")}
          initialFilters={initialFilters}
          source={source}
        />
      </div>
    </div>
  );
}
