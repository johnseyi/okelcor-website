import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import NewsCard from "@/components/news/news-card";
import { ALL_ARTICLES } from "@/components/news/data";
import Reveal from "@/components/motion/reveal";
import { StaggerParent, StaggerChild } from "@/components/motion/stagger";

export const metadata: Metadata = {
  title: "News – Okelcor",
  description:
    "Insights, updates, and tyre supply knowledge for distributors, partners, and international buyers.",
};

export default function NewsPage() {
  const [featured, ...rest] = ALL_ARTICLES;

  return (
    <main>
      <Navbar />

      <PageHero
        eyebrow="News & Insights"
        title="Insights, updates, and tyre supply knowledge."
        subtitle="Stay informed with practical articles and updates for distributors, partners, and international buyers."
        image="https://i.pinimg.com/1200x/01/3a/b4/013ab438c9f5724a8a7e13a01a1af213.jpg"
      />

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
              Latest Articles
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

      <Footer />
    </main>
  );
}
