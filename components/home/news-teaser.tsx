import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { getServerLocale } from "@/lib/locale";

/**
 * The latest three articles. Heuver runs a whole Knowledge section because
 * in this trade, useful content is how a supplier proves it knows tyres
 * before anyone wires a deposit. The articles already exist in the CMS; the
 * homepage just never showed them.
 */

type ArticleRow = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  image?: string | null;
  category?: string | null;
  read_time?: string | null;
  published_at?: string | null;
};

export default async function NewsTeaser() {
  let articles: ArticleRow[] = [];

  try {
    const locale = await getServerLocale();
    const res: ApiResponse<ArticleRow[]> = await apiFetch<ArticleRow[]>("/articles", {
      locale,
      params: { per_page: "3" },
      revalidate: 600,
      tags: ["articles"],
    });
    articles = (res.data ?? []).slice(0, 3);
  } catch {
    return null;
  }

  if (articles.length === 0) return null;

  return (
    <section aria-label="Tyre knowledge and news" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-[#171a20] sm:text-[1.7rem]">
            From the tyre desk
          </h2>
          <Link
            href="/news"
            className="hidden shrink-0 items-center gap-1.5 text-[0.9rem] font-semibold text-[#171a20] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-[#f4511e] sm:flex"
          >
            All articles
            <ArrowRight size={14} strokeWidth={2.4} aria-hidden />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.id}
              href={`/news/${a.slug}`}
              className="group overflow-hidden rounded-lg border border-black/10 bg-white transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4511e]"
            >
              {a.image && (
                <div className="relative aspect-[16/9] overflow-hidden bg-[#f5f5f5]">
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-wide text-[#8c8f94]">
                  {a.category && <span className="text-[#f4511e]">{a.category}</span>}
                  {a.read_time && <span>{a.read_time}</span>}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[1rem] font-bold leading-snug text-[#171a20]">{a.title}</p>
                {a.summary && (
                  <p className="mt-1.5 line-clamp-2 text-[0.85rem] leading-snug text-[#5c5e62]">{a.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
