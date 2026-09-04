import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMPANY_PHONE } from "@/lib/constants";

/**
 * The closing ask, said plainly. Replaces (on the homepage only) a CTA card
 * with a magnetic hover button, a radial glow, a stagger-in animation and a
 * letter-spaced eyebrow — none of which ever shipped a container. Two
 * actions and the phone number, because half of this trade still closes on
 * a call.
 */
export default function QuoteCta() {
  const tel = COMPANY_PHONE.replace(/[^+\d]/g, "");

  return (
    <section className="bg-[#171a20]">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <h2 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-[1.8rem]">
            Tell us what you need moved
          </h2>
          <p className="mt-2 max-w-xl text-pretty text-[0.95rem] leading-relaxed text-white/60">
            Size, quantity and destination — we come back with a written
            quote, delivery terms and the export paperwork sorted.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Link
            href="/quote"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-[#f4511e] px-6 text-[0.95rem] font-bold text-white transition-colors hover:bg-[#df4618]"
          >
            Request a quote
            <ArrowRight size={15} strokeWidth={2.4} aria-hidden />
          </Link>
          <a
            href={`tel:${tel}`}
            className="inline-flex h-12 items-center rounded-md border border-white/25 px-6 text-[0.95rem] font-semibold text-white transition-colors hover:border-white/60"
          >
            {COMPANY_PHONE}
          </a>
        </div>
      </div>
    </section>
  );
}
