import { ProductDetailSkeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Navbar placeholder */}
      <div className="h-[76px] border-b border-black/[0.06] bg-white" aria-hidden="true" />

      <div className="tesla-shell py-6 md:py-10">
        {/* Breadcrumb */}
        <div className="mb-6 h-3 w-48 animate-pulse rounded-full bg-[#e0e0e0]" aria-hidden="true" />

        <ProductDetailSkeleton />

        {/* Accordion placeholder */}
        <div className="mt-10 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[56px] animate-pulse rounded-[14px] bg-[#e0e0e0]"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
