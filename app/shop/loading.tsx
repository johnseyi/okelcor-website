import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Navbar placeholder */}
      <div className="h-[76px] border-b border-black/[0.06] bg-white" aria-hidden="true" />

      {/* Page hero placeholder */}
      <div
        className="h-[280px] animate-pulse bg-[#e0e0e0] md:h-[360px]"
        aria-hidden="true"
      />

      {/* Catalogue area */}
      <section className="w-full py-10">
        <div className="tesla-shell">
          {/* Filter bar placeholder */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <div className="h-[44px] w-full animate-pulse rounded-[12px] bg-[#e0e0e0] sm:w-[260px]" aria-hidden="true" />
            <div className="h-[44px] w-[120px] animate-pulse rounded-[12px] bg-[#e0e0e0]" aria-hidden="true" />
          </div>
          <ProductGridSkeleton />
        </div>
      </section>
    </div>
  );
}
