"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft, Clock, Calendar } from "lucide-react";
import NewsCard from "@/components/news/news-card";
import { useLanguage } from "@/context/language-context";
import { getLocalizedArticle, getLocalizedRelatedArticles, type Article } from "./data";

type Props = {
  slug: string;
  article?: Article;
  related?: Article[];
};

export default function ArticleUI({ slug, article: articleProp, related: relatedProp }: Props) {
  const { locale, t } = useLanguage();
  const article = articleProp ?? getLocalizedArticle(slug, locale);
  const related = relatedProp ?? getLocalizedRelatedArticles(slug, locale);

  if (!article) return null;

  return (
    <>
      {/* Hero image */}
      <div className="w-full pt-[76px] lg:pt-20">
        <div className="relative h-[45vh] min-h-[260px] max-h-[560px] overflow-hidden sm:h-[52vh] sm:min-h-[320px]">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{ backgroundImage: `url('${article.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />

          {/* Category badge */}
          <div className="absolute left-0 right-0 top-6 z-10 flex justify-center">
            <span className="rounded-full bg-[var(--primary)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
              {article.category}
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-10 text-center">
            <h1 className="mx-auto max-w-4xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl md:text-5xl">
              {article.title}
            </h1>
            <div className="mt-4 flex items-center justify-center gap-5 text-white/70">
              <span className="flex items-center gap-1.5 text-[0.85rem]">
                <Calendar size={13} strokeWidth={1.8} />
                {article.date}
              </span>
              <span className="h-3 w-px bg-white/30" />
              <span className="flex items-center gap-1.5 text-[0.85rem]">
                <Clock size={13} strokeWidth={1.8} />
                {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <section className="w-full bg-[#f5f5f5] py-10 md:py-14">
        <div className="tesla-shell">
          <div className="mx-auto max-w-[780px]">

            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)]">
              <Link href="/" className="transition hover:text-[var(--foreground)]">{t.nav.home}</Link>
              <ChevronRight size={13} className="opacity-50" />
              <Link href="/news" className="transition hover:text-[var(--foreground)]">{t.news.breadcrumbNews}</Link>
              <ChevronRight size={13} className="opacity-50" />
              <span className="max-w-[240px] truncate font-medium text-[var(--foreground)] sm:max-w-none">
                {article.title}
              </span>
            </nav>

            {/* Summary callout */}
            <div className="mb-8 rounded-[16px] border-l-4 border-[var(--primary)] bg-[#efefef] px-6 py-5">
              <p className="text-[1rem] leading-7 font-medium text-[var(--foreground)]">
                {article.summary}
              </p>
            </div>

            {/* Body paragraphs */}
            <div className="flex flex-col gap-6">
              {(article.body ?? []).map((paragraph, i) => (
                <p key={i} className="text-[1rem] leading-8 text-[var(--muted)]">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Back link */}
            <div className="mt-12 border-t border-black/[0.07] pt-8">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-2.5 text-[0.88rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
              >
                <ArrowLeft size={15} strokeWidth={2} />
                {t.news.backToNews}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="w-full bg-[#f5f5f5] pb-12">
          <div className="tesla-shell">
            <div className="mb-6 border-t border-black/[0.07] pt-10">
              <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                {t.news.continueReading}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
                {t.news.moreFromNews}
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <NewsCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
