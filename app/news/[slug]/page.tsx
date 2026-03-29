import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ArticleUI from "@/components/news/article-ui";
import { ALL_ARTICLES, getArticleBySlug } from "@/components/news/data";
import { SITE_URL } from "@/lib/constants";

const MONTHS: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

function toISODate(humanDate: string): string {
  const [day, month, year] = humanDate.split(" ");
  return `${year}-${MONTHS[month] ?? "01"}-${day.padStart(2, "0")}`;
}

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ALL_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: `${article.title} – Okelcor`,
      description: article.summary,
      url: `/news/${article.slug}`,
      type: "article",
      images: [{ url: article.image, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      title: `${article.title} – Okelcor`,
      description: article.summary,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    image: article.image.startsWith("/") ? `${SITE_URL}${article.image}` : article.image,
    datePublished: toISODate(article.date),
    author: { "@type": "Organization", name: "Okelcor", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Okelcor",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/okelcor-logo.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/news/${slug}` },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Navbar />
      <ArticleUI slug={slug} />
      <Footer />
    </main>
  );
}
