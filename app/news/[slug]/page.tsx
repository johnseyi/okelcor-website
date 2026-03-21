import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Clock, Calendar } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import NewsCard from "@/components/news/news-card";
import { ALL_ARTICLES, getArticleBySlug, getRelatedArticles } from "@/components/news/data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ALL_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found – Okelcor" };
  return {
    title: `${article.title} – Okelcor News`,
    description: article.summary,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article);

  return (
    <main>
      <Navbar />

      {/* ── Hero image ── */}
      <div className="w-full pt-[76px] lg:pt-20">
        <div className="relative h-[52vh] min-h-[320px] max-h-[560px] overflow-hidden">
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
            <h1 className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
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

      {/* ── Article body ── */}
      <section className="w-full bg-[#f5f5f5] py-10 md:py-14">
        <div className="tesla-shell">
          <div className="mx-auto max-w-[780px]">

            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)]">
              <Link href="/" className="transition hover:text-[var(--foreground)]">Home</Link>
              <ChevronRight size={13} className="opacity-50" />
              <Link href="/news" className="transition hover:text-[var(--foreground)]">News</Link>
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
              {article.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[1rem] leading-8 text-[var(--muted)]"
                >
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
                Back to News
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <section className="w-full bg-[#f5f5f5] pb-12">
          <div className="tesla-shell">
            <div className="mb-6 border-t border-black/[0.07] pt-10">
              <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                Continue Reading
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
                More from Okelcor News
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

      <Footer />
    </main>
  );
}
