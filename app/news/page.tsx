import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import NewsPageUI from "@/components/news/news-page-ui";
import { apiFetch, type ApiArticle } from "@/lib/api";
import type { Article } from "@/components/news/data";
import { getServerLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "News & Insights",
  description:
    "Insights, updates, and tyre supply knowledge for distributors, partners, and international buyers.",
  openGraph: {
    title: "News & Insights – Okelcor",
    description:
      "Tyre supply updates, market insights, and logistics knowledge for global distributors and buyers.",
    url: "/news",
    type: "website",
  },
  twitter: {
    title: "News & Insights – Okelcor",
    description:
      "Tyre supply updates and market insights for global distributors and buyers.",
  },
};

/** Map API article shape → local Article shape used by NewsCard / ArticleUI. */
function toArticle(a: ApiArticle): Article {
  return {
    slug:     a.slug,
    image:    a.image ?? a.image_url ?? "",
    category: a.category ?? "",
    title:    a.title ?? "",
    date:     a.published_at ?? a.date ?? "",
    readTime: a.read_time ?? "",
    summary:  a.summary ?? "",
    body:     Array.isArray(a.body) ? a.body : [],
  };
}

async function getArticles(locale: string): Promise<Article[] | undefined> {
  try {
    const res = await apiFetch<ApiArticle[]>("/articles", {
      locale,
      revalidate: 60,
      tags: ["articles", `articles-${locale}`],
    });
    return res.data?.length ? res.data.map(toArticle) : undefined;
  } catch {
    return undefined;
  }
}

export default async function NewsPage() {
  const locale = await getServerLocale();
  const articles = await getArticles(locale);

  return (
    <main>
      <Navbar />
      <NewsPageUI articles={articles} />
      <Footer />
    </main>
  );
}
