/**
 * lib/search.ts
 *
 * Client-side search engine for the Okelcor site.
 *
 * Indexes products (from components/shop/data) and articles (from components/news/data)
 * against a freetext query. Returns results ranked by relevance, grouped by kind.
 *
 * No external libraries — pure TypeScript token matching with field-weighted scoring.
 */

import { ALL_PRODUCTS } from "@/components/shop/data";
import { getLocalizedArticles } from "@/components/news/data";
import type { Locale } from "@/lib/translations";

// ─── Result types ─────────────────────────────────────────────────────────────

export type SearchResultProduct = {
  kind: "product";
  id: number;
  brand: string;
  name: string;
  size: string;
  type: string;
  price: number;
  image: string;
  href: string;
};

export type SearchResultArticle = {
  kind: "article";
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  href: string;
};

export type SearchResult = SearchResultProduct | SearchResultArticle;

export type SearchResults = {
  products: SearchResultProduct[];
  articles: SearchResultArticle[];
  total: number;
};

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Scores a candidate against a tokenized query.
 * Fields listed first are weighted higher (descending weight).
 * Returns 0 if no tokens match (excluded from results).
 */
function score(tokens: string[], ...fields: string[]): number {
  if (tokens.length === 0) return 0;
  let total = 0;
  const weight = fields.length + 1;
  for (const token of tokens) {
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].toLowerCase().includes(token)) {
        total += weight - i;
      }
    }
  }
  return total;
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/[\s/]+/)          // split on whitespace and slashes (tyre sizes: 205/55R16)
    .filter((t) => t.length >= 1);
}

// ─── Search function ──────────────────────────────────────────────────────────

const MAX_PRODUCTS = 6;
const MAX_ARTICLES = 4;

export function search(query: string, locale: Locale): SearchResults {
  const tokens = tokenize(query);

  if (tokens.length === 0) {
    return { products: [], articles: [], total: 0 };
  }

  // ── Products ────────────────────────────────────────────────────────────────
  // Fields in descending importance: brand, name, size, type, season, spec, sku, description
  const scoredProducts = ALL_PRODUCTS.map((p) => ({
    result: {
      kind: "product" as const,
      id: p.id,
      brand: p.brand,
      name: p.name,
      size: p.size,
      type: p.type,
      price: p.price,
      image: p.image,
      href: `/shop/${p.id}`,
    },
    score: score(tokens, p.brand, p.name, p.size, p.type, p.season, p.spec, p.sku, p.description),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PRODUCTS)
    .map((x) => x.result);

  // ── Articles ─────────────────────────────────────────────────────────────────
  // Fields in descending importance: title, category, summary
  const articles = getLocalizedArticles(locale);
  const scoredArticles = articles.map((a) => ({
    result: {
      kind: "article" as const,
      slug: a.slug,
      title: a.title,
      category: a.category,
      date: a.date,
      image: a.image,
      href: `/news/${a.slug}`,
    },
    score: score(tokens, a.title, a.category, a.summary),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ARTICLES)
    .map((x) => x.result);

  return {
    products: scoredProducts,
    articles: scoredArticles,
    total: scoredProducts.length + scoredArticles.length,
  };
}
