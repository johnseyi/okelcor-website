"use client";

import PageHero from "@/components/page-hero";
import { useLanguage } from "@/context/language-context";

export default function QuoteHero() {
  const { t } = useLanguage();
  return (
    <PageHero
      eyebrow={t.quote.hero.eyebrow}
      title={t.quote.hero.title}
      subtitle={t.quote.hero.subtitle}
      image="/images/tyre-primary.png"
    />
  );
}
