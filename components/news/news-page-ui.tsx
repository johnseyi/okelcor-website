"use client";

import PageHero from "@/components/page-hero";
import NewsCard from "@/components/news/news-card";
import Reveal from "@/components/motion/reveal";
import { StaggerParent, StaggerChild } from "@/components/motion/stagger";
import FadeUp from "@/components/motion/fade-up";
import { useLanguage } from "@/context/language-context";
import { getLocalizedArticles, type Article } from "./data";

type NewsPageUIProps = {
  /** Live articles from the API (locale pre-resolved). Falls back to static when undefined. */
  articles?: Article[];
};

export default function NewsPageUI({ articles: apiArticles }: NewsPageUIProps) {
  const { locale, t } = useLanguage();
  const [featured, ...rest] = apiArticles ?? getLocalizedArticles(locale);

  return (
    <>
      <PageHero
        eyebrow={t.news.hero.eyebrow}
        title={t.news.hero.title}
        subtitle={t.news.hero.subtitle}
        image="/images/pexels-muhammedtarikkahraman-16706765.jpg"
      />

      <FadeUp>
      <section className="w-full bg-[#f5f5f5] py-10 md:py-14">
        <div className="tesla-shell flex flex-col gap-6">

          {/* Featured article */}
          <Reveal>
            <NewsCard article={featured} featured />
          </Reveal>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-black/[0.07]" />
            <span className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {t.news.latestArticles}
            </span>
            <div className="h-px flex-1 bg-black/[0.07]" />
          </div>

          {/* Grid */}
          <StaggerParent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <StaggerChild key={article.slug}>
                <NewsCard article={article} />
              </StaggerChild>
            ))}
          </StaggerParent>

        </div>
      </section>
      </FadeUp>
    </>
  );
}
