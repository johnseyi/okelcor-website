"use client";

/**
 * context/search-context.tsx
 *
 * Global search state — open/close modal, current query, computed results.
 *
 * Results are fetched from GET /api/v1/search?q={query}&locale={locale} with a
 * 300 ms debounce. Falls back to the local lib/search.ts engine if the API
 * call fails or the backend is unavailable.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { search, type SearchResults } from "@/lib/search";
import { useLanguage } from "@/context/language-context";
import { apiFetch, type SearchApiData } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchContextValue = {
  isOpen: boolean;
  query: string;
  results: SearchResults;
  isSearching: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (q: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const SearchContext = createContext<SearchContextValue | null>(null);

const EMPTY: SearchResults = { products: [], articles: [], total: 0 };

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SearchProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced API search with local fallback
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(EMPTY);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch<SearchApiData>("/search", {
          locale,
          params: { q: trimmed },
          revalidate: false,
        });

        const apiData = res.data;
        const products = (apiData?.products ?? []).map((p) => ({
          kind: "product" as const,
          id: p.id,
          brand: p.brand,
          name: p.name,
          size: p.size ?? "",
          type: p.type ?? "",
          price: p.price,
          image: p.image_url ?? p.image ?? "",
          href: `/shop/${p.id}`,
        }));
        const articles = (apiData?.articles ?? []).map((a) => ({
          kind: "article" as const,
          slug: a.slug,
          title: a.title,
          category: a.category ?? "",
          date: a.date ?? "",
          image: a.image_url ?? a.image ?? "",
          href: `/news/${a.slug}`,
        }));
        setResults({ products, articles, total: products.length + articles.length });
      } catch {
        // API unavailable — fall back to local search
        setResults(search(trimmed, locale));
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, locale]);

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQueryState("");
  };

  const setQuery = (q: string) => setQueryState(q);

  return (
    <SearchContext.Provider
      value={{ isOpen, query, results, isSearching, openSearch, closeSearch, setQuery, inputRef }}
    >
      {children}
    </SearchContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}
