/**
 * Skeleton system — animate-pulse placeholders for every data-fetching section.
 *
 * All shapes use the same neutral surface colour (#e0e0e0) and the Tailwind
 * animate-pulse class. No external dependencies.
 *
 * Usage:
 *   import { HeroSkeleton } from "@/components/ui/skeleton";
 *   <Suspense fallback={<HeroSkeleton />}><HeroSection /></Suspense>
 */

// ── Base atom ─────────────────────────────────────────────────────────────────
// Accepts any Tailwind className to control size/shape/rounding.
function Sk({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#e0e0e0] ${className}`}
    />
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function HeroSkeleton() {
  return (
    <div className="w-full pt-[76px] lg:pt-20">
      <Sk className="h-[82vh] min-h-[460px] max-h-[700px] w-full" />
    </div>
  );
}

// ── Categories carousel ───────────────────────────────────────────────────────
export function CategoriesSkeleton() {
  return (
    <section className="w-full bg-[#f5f5f5] py-8 md:py-10">
      <div className="tesla-shell">
        {/* Heading */}
        <div className="mb-6 space-y-2.5 px-1">
          <Sk className="h-2.5 w-20 rounded-full" />
          <Sk className="h-8 w-52 rounded-[8px]" />
        </div>
        {/* Cards — show 3 peeking at the edge like the real carousel */}
        <div className="flex gap-7 overflow-hidden px-1">
          {[0, 1, 2].map((i) => (
            <Sk
              key={i}
              className="h-[360px] min-w-[88%] shrink-0 rounded-[22px] sm:h-[420px] md:h-[580px] md:min-w-[68%] lg:min-w-[62%]"
            />
          ))}
        </div>
        {/* Pagination dots */}
        <div className="mt-6 flex justify-center gap-3">
          {[0, 1, 2].map((i) => (
            <Sk key={i} className="h-3 w-3 rounded-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Products grid ─────────────────────────────────────────────────────────────
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-[22px] bg-[#efefef]"
        >
          {/* Image placeholder */}
          <Sk className="aspect-[4/3] rounded-none" />
          {/* Text content */}
          <div className="flex flex-1 flex-col gap-3 p-5">
            <Sk className="h-2.5 w-14 rounded-full" />
            <Sk className="h-4 w-full rounded-[6px]" />
            <Sk className="h-3 w-28 rounded-[6px]" />
            <div className="mt-auto pt-3">
              <Sk className="h-7 w-20 rounded-[6px]" />
              <div className="mt-3 flex gap-2">
                <Sk className="h-[48px] flex-1 rounded-full" />
                <Sk className="h-[48px] w-[80px] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Brands strip ─────────────────────────────────────────────────────────────
export function BrandsSkeleton() {
  return (
    <section className="w-full bg-[#f5f5f5] py-6">
      <div className="tesla-shell">
        {/* Heading */}
        <div className="mb-8 space-y-2.5 text-center">
          <Sk className="mx-auto h-2.5 w-20 rounded-full" />
          <Sk className="mx-auto h-8 w-48 rounded-[8px]" />
        </div>
        {/* Logo grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Sk key={i} className="h-[110px] rounded-[22px]" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Articles (news page) ──────────────────────────────────────────────────────
export function ArticlesSkeleton() {
  return (
    <div className="space-y-5">
      {/* Featured card */}
      <div className="grid overflow-hidden rounded-[22px] bg-[#efefef] md:grid-cols-[1.4fr_1fr]">
        <Sk className="aspect-[16/10] rounded-none md:aspect-auto md:min-h-[380px]" />
        <div className="flex flex-col justify-between gap-4 p-6 sm:p-8 md:p-10">
          <div className="space-y-3">
            <Sk className="h-2.5 w-16 rounded-full" />
            <Sk className="h-8 w-full rounded-[8px]" />
            <Sk className="h-4 w-full rounded-[6px]" />
            <Sk className="h-4 w-4/5 rounded-[6px]" />
            <Sk className="h-4 w-3/5 rounded-[6px]" />
          </div>
          <Sk className="h-4 w-24 rounded-full" />
        </div>
      </div>

      {/* Regular card grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-[22px] bg-[#efefef]"
          >
            <Sk className="aspect-[16/10] rounded-none" />
            <div className="flex flex-1 flex-col gap-3 p-6">
              <Sk className="h-2.5 w-14 rounded-full" />
              <Sk className="h-4 w-full rounded-[6px]" />
              <Sk className="h-4 w-4/5 rounded-[6px]" />
              <Sk className="mt-auto h-4 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Product detail page ───────────────────────────────────────────────────────
export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Left — gallery */}
      <div className="space-y-3">
        <Sk className="aspect-square w-full rounded-[22px]" />
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <Sk key={i} className="h-[80px] w-[80px] shrink-0 rounded-[12px] sm:h-[88px] sm:w-[88px]" />
          ))}
        </div>
      </div>

      {/* Right — info */}
      <div className="space-y-4">
        {/* Breadcrumb */}
        <Sk className="h-3 w-40 rounded-full" />
        {/* Brand eyebrow */}
        <Sk className="h-2.5 w-16 rounded-full" />
        {/* Title */}
        <Sk className="h-10 w-3/4 rounded-[8px]" />
        {/* Size / spec */}
        <Sk className="h-3 w-32 rounded-full" />
        {/* Price */}
        <Sk className="h-9 w-28 rounded-[8px]" />
        {/* Divider */}
        <div className="my-2 h-px bg-black/[0.06]" aria-hidden="true" />
        {/* Spec rows */}
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Sk className="h-3 w-20 rounded-full" />
            <Sk className="h-3 w-24 rounded-full" />
          </div>
        ))}
        {/* Add to cart */}
        <div className="mt-4 space-y-2">
          <Sk className="h-[54px] w-full rounded-full" />
          <Sk className="h-[48px] w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
