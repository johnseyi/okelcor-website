import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * FET, said once, calmly. It replaces both the full-height FetShowcase
 * section and the delayed FetPromo popup — a real second product line
 * deserves a permanent place on the page, not an interruption that follows
 * the visitor around. Green stays FET's colour (the fet-* token namespace);
 * the band borrows nothing from the tyre brand orange.
 */
export default function FetBand() {
  return (
    <section aria-label="FET fuel efficiency technology" className="border-y border-black/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[0.78rem] font-semibold text-[#15803d]">Also from Okelcor</p>
          <h2 className="mt-1 text-balance text-xl font-bold tracking-tight text-[#171a20] sm:text-2xl">
            FET fuel efficiency technology for fleets
          </h2>
          <p className="mt-2 text-pretty text-[0.95rem] leading-relaxed text-[#5c5e62]">
            A fitted device matched to your engine class &mdash; four models
            covering everything from small petrol cars to heavy commercial
            vehicles. Check which model fits your fleet in the engine lookup.
          </p>
        </div>
        <Link
          href="/fet"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-[#15803d] px-5 text-[0.9rem] font-bold text-[#15803d] transition-colors hover:bg-[#15803d] hover:text-white"
        >
          Find your engine
          <ArrowRight size={15} strokeWidth={2.4} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
