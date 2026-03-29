"use client";

import { useLanguage } from "@/context/language-context";

export default function ShopHero() {
  const { t } = useLanguage();
  return (
    <section className="w-full pt-[76px] lg:pt-20">
      <div className="relative h-[44vh] min-h-[280px] max-h-[460px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/sections/tyre-bg-light.png')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
            {t.shop.hero.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            {t.shop.hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-[1rem] leading-7 text-white/80">
            {t.shop.hero.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
