"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CarFinder from "@/components/shop/car-finder";
import ShopCatalogue from "@/components/shop/shop-catalogue";

export default function ShopPageClient({
  initialFilters,
}: {
  initialFilters?: Record<string, string>;
}) {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const [prefilledSize, setPrefilledSize] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/shop");
    }
  }, [isLoading, isAuthenticated, router]);

  // While auth is being verified, show a neutral loading state so
  // unauthenticated users never see a flash of shop content.
  if (isLoading || !isAuthenticated) {
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
    <div style={{ paddingTop: "calc(var(--bar-h, 0px) + 76px)" }}>
      <CarFinder onSizeSelect={setPrefilledSize} />
      <div id="shop-catalogue">
        <ShopCatalogue
          prefilledSize={prefilledSize}
          onPrefilledSizeConsumed={() => setPrefilledSize("")}
          initialFilters={initialFilters}
        />
      </div>
    </div>
  );
}
