"use client";

import Link from "next/link";
import { useStagger } from "@/hooks/useStagger";
import { useLanguage } from "@/context/language-context";

export default function CTASection() {
  const { t } = useLanguage();

  // Stagger the four direct children (eyebrow → title → subtitle → button)
  // so they cascade into view rather than appearing all at once.
  const cardRef = useStagger<HTMLDivElement>({ stagger: 0.11, y: 18 });

  return (
    <section className="w-full bg-[#f5f5f5] py-5">
      <div className="tesla-shell">
        <div ref={cardRef} className="rounded-[22px] bg-[#efefef] px-6 py-10 text-center md:px-16 md:py-16">
          <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
            {t.cta.eyebrow}
          </p>

          <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl lg:text-5xl">
            {t.cta.title}
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
            {t.cta.subtitle}
          </p>

          <div className="mt-7 flex justify-center">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-8 py-3 text-[14px] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              {t.cta.button}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}