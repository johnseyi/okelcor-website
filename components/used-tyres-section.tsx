"use client";

import Link from "next/link";
import Reveal from "@/components/motion/reveal";
import { useLanguage } from "@/context/language-context";

export default function UsedTyresSection() {
  const { t } = useLanguage();

  return (
    <section className="w-full bg-[#f5f5f5] py-6">
      <div className="tesla-shell">
        <Reveal className="overflow-hidden rounded-[22px] bg-[#efefef]">
          <div className="grid md:grid-cols-[1fr_1fr]">

            <div className="flex items-center px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12">
              <div className="max-w-[520px]">
                <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                  {t.used.eyebrow}
                </p>

                <h2 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-tight text-[var(--foreground)] md:text-4xl">
                  {t.used.title}
                </h2>

                <p className="mt-4 text-[1rem] leading-7 text-[var(--muted)]">
                  {t.used.body}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex h-[48px] items-center justify-center rounded-full bg-[var(--primary)] px-6 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                  >
                    {t.used.viewCatalogue}
                  </Link>
                  <Link
                    href="/quote"
                    className="inline-flex h-[48px] items-center justify-center rounded-full border border-black/10 bg-white px-6 text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
                  >
                    {t.used.requestQuote}
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative min-h-[320px] md:min-h-[420px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.02]"
                style={{ backgroundImage: "url('/sections/used-tyres.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/8 via-transparent to-transparent" />
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
