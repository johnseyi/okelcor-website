import { ArticlesSkeleton } from "@/components/ui/skeleton";

export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Navbar placeholder */}
      <div className="h-[76px] border-b border-black/[0.06] bg-white" aria-hidden="true" />

      {/* Page hero placeholder */}
      <div
        className="h-[280px] animate-pulse bg-[#e0e0e0] md:h-[360px]"
        aria-hidden="true"
      />

      {/* Articles section */}
      <section className="w-full py-10 md:py-16">
        <div className="tesla-shell">
          <ArticlesSkeleton />
        </div>
      </section>
    </div>
  );
}
