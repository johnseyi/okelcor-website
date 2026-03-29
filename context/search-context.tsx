"use client";

/**
 * context/search-context.tsx
 *
 * Global search state — open/close modal, current query, computed results.
 *
 * Pattern mirrors cart-context.tsx: Provider wraps the root layout,
 * useSearch() is the consumer hook.
 *
 * Search is computed with useMemo whenever query or locale changes —
 * no debounce needed for the current dataset size (~20 products + articles).
 */

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { search, type SearchResults } from "@/lib/search";
import { useLanguage } from "@/context/language-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchContextValue = {
  isOpen: boolean;
  query: string;
  results: SearchResults;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (q: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const SearchContext = createContext<SearchContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SearchProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<SearchResults>(() => {
    if (!query.trim()) return { products: [], articles: [], total: 0 };
    return search(query, locale);
  }, [query, locale]);

  const openSearch = () => {
    setIsOpen(true);
    // Focus the input on the next tick after the modal has rendered
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQueryState("");
  };

  const setQuery = (q: string) => setQueryState(q);

  return (
    <SearchContext.Provider
      value={{ isOpen, query, results, openSearch, closeSearch, setQuery, inputRef }}
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
