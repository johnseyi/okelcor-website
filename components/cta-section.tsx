"use client";

import Link from "next/link";
import { useLanguage } from "@/context/language-context";

/**
 * The shared closing ask, in the system language: an ink band, two plain
 * actions. Replaces a card with a stagger-in animation (which left the whole
 * section half faded until scroll fired), a magnetic hover button, a radial
 * glow and a letter-spaced eyebrow.
 */
export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="w-full bg-[#171a20]">
      <div className="tesla-shell flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="max-w-2xl text-balance text-2xl font-bold tracking-tight text-white sm:text-[1.8rem]">
            {t.cta.title}
          </h2>
          <p className="mt-2 max-w-xl text-pretty text-[0.95rem] leading-relaxed text-white/60">
            {t.cta.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Link
            href="/tyre-supply-quotation"
            className="inline-flex h-12 items-center rounded-md bg-[#f4511e] px-6 text-[0.95rem] font-bold text-white transition-colors hover:bg-[#df4618]"
          >
            {t.cta.button}
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center rounded-md border border-white/25 px-6 text-[0.95rem] font-semibold text-white transition-colors hover:border-white/60"
          >
            {t.cta.button2}
          </Link>
        </div>
      </div>
    </section>
  );
}
