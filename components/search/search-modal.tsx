"use client";

/**
 * components/search/search-modal.tsx
 *
 * Full-screen search overlay with:
 *   - GSAP backdrop fade + modal slide-up on open/close
 *   - Real-time results as the user types (via SearchContext)
 *   - Results grouped into Products and Articles sections
 *   - Keyboard navigation: ↑↓ to move, Enter to open, Escape to close
 *   - Cmd/Ctrl+K global shortcut to open from anywhere
 *   - i18n via useLanguage()
 */

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { gsap, useGSAP, ease, prefersReducedMotion } from "@/lib/gsap";
import { useSearch } from "@/context/search-context";
import { useLanguage } from "@/context/language-context";
import type { SearchResult } from "@/lib/search";

// ─── Result item ──────────────────────────────────────────────────────────────

function ResultItem({
  result,
  isActive,
  onClose,
  index,
  listId,
}: {
  result: SearchResult;
  isActive: boolean;
  onClose: () => void;
  index: number;
  listId: string;
}) {
  const itemRef = useRef<HTMLAnchorElement>(null);

  // Scroll active item into view
  useEffect(() => {
    if (isActive) itemRef.current?.scrollIntoView({ block: "nearest" });
  }, [isActive]);

  const isProduct = result.kind === "product";
  const label = isProduct
    ? `${result.brand} ${result.name} ${result.size}`
    : result.title;
  const sub = isProduct
    ? `${result.type} · €${result.price.toFixed(2)}`
    : `${result.category} · ${result.date}`;

  return (
    <Link
      ref={itemRef}
      href={result.href}
      id={`${listId}-item-${index}`}
      role="option"
      aria-selected={isActive}
      onClick={onClose}
      className={`flex items-center gap-4 rounded-[14px] px-4 py-3 transition-colors ${
        isActive
          ? "bg-[var(--primary)]/8 ring-1 ring-[var(--primary)]/20"
          : "hover:bg-black/[0.04]"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-[#efefef]">
        {result.image ? (
          <Image
            src={result.image}
            alt={label}
            fill
            className="object-cover"
            sizes="48px"
            loading="lazy"
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[0.6rem] font-bold uppercase tracking-widest text-[#aaa]">
            {label.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9rem] font-semibold text-[var(--foreground)]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[0.78rem] text-[var(--muted)]">{sub}</p>
      </div>

      {/* Badge + arrow */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full bg-[#efefef] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--muted)]">
          {isProduct ? result.type : "Article"}
        </span>
        <ArrowRight size={14} className="text-[var(--muted)]" />
      </div>
    </Link>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function SearchModal() {
  const { isOpen, query, results, openSearch, closeSearch, setQuery, inputRef } =
    useSearch();
  const { t } = useLanguage();

  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Flat list for keyboard navigation
  const allResults: SearchResult[] = [
    ...results.products,
    ...results.articles,
  ];
  const activeIndexRef = useRef(-1);
  const listId = "search-results-list";

  // ── Cmd/Ctrl+K global shortcut ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) closeSearch();
        else openSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, openSearch, closeSearch]);

  // ── Keyboard navigation inside modal ──────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSearch();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndexRef.current = Math.min(
          activeIndexRef.current + 1,
          allResults.length - 1,
        );
        // Trigger re-render via query state trick — we use data attribute instead
        const items = document.querySelectorAll(`[id^="${listId}-item-"]`);
        items.forEach((el, i) => {
          const isActive = i === activeIndexRef.current;
          el.setAttribute("aria-selected", String(isActive));
          if (isActive) {
            el.classList.add("bg-[var(--primary)]/8", "ring-1", "ring-[var(--primary)]/20");
            el.classList.remove("hover:bg-black/[0.04]");
            (el as HTMLElement).scrollIntoView({ block: "nearest" });
          } else {
            el.classList.remove("bg-[var(--primary)]/8", "ring-1", "ring-[var(--primary)]/20");
            el.classList.add("hover:bg-black/[0.04]");
          }
        });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndexRef.current = Math.max(activeIndexRef.current - 1, -1);
        const items = document.querySelectorAll(`[id^="${listId}-item-"]`);
        items.forEach((el, i) => {
          const isActive = i === activeIndexRef.current;
          el.setAttribute("aria-selected", String(isActive));
          if (isActive) {
            el.classList.add("bg-[var(--primary)]/8", "ring-1", "ring-[var(--primary)]/20");
            el.classList.remove("hover:bg-black/[0.04]");
            (el as HTMLElement).scrollIntoView({ block: "nearest" });
          } else {
            el.classList.remove("bg-[var(--primary)]/8", "ring-1", "ring-[var(--primary)]/20");
            el.classList.add("hover:bg-black/[0.04]");
          }
        });
        return;
      }
      if (e.key === "Enter" && activeIndexRef.current >= 0) {
        e.preventDefault();
        const active = allResults[activeIndexRef.current];
        if (active) {
          closeSearch();
          window.location.href = active.href;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allResults, closeSearch],
  );

  // Reset active index when results change
  useEffect(() => {
    activeIndexRef.current = -1;
  }, [query]);

  // ── Scroll lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── GSAP: establish hidden initial states ──────────────────────────────────
  useGSAP(() => {
    if (!backdropRef.current || !modalRef.current) return;
    gsap.set(backdropRef.current, { autoAlpha: 0 });
    gsap.set(modalRef.current, { autoAlpha: 0, y: 20 });
  }, { scope: backdropRef });

  // ── GSAP: open / close animations ─────────────────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const backdrop = backdropRef.current;
    const modal = modalRef.current;
    if (!backdrop || !modal) return;

    const reduced = prefersReducedMotion();

    if (isOpen) {
      if (reduced) {
        gsap.set([backdrop, modal], { autoAlpha: 1, y: 0 });
      } else {
        gsap.to(backdrop, { autoAlpha: 1, duration: 0.22 });
        gsap.fromTo(
          modal,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.28, ease: ease.smooth },
        );
      }
    } else {
      if (reduced) {
        gsap.set([backdrop, modal], { autoAlpha: 0 });
      } else {
        gsap.to(backdrop, {
          autoAlpha: 0,
          duration: 0.18,
          onInterrupt: () => { gsap.set(backdrop, { autoAlpha: 0 }); },
        });
        gsap.to(modal, {
          autoAlpha: 0,
          y: 12,
          duration: 0.18,
          ease: ease.sharp,
          onInterrupt: () => { gsap.set(modal, { autoAlpha: 0 }); },
        });
      }
    }

    return () => {
      gsap.killTweensOf([backdrop, modal]);
    };
  }, [isOpen]);

  const hasResults = results.total > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 px-4 pt-[80px] backdrop-blur-sm sm:pt-[100px]"
      style={{ visibility: "hidden" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSearch();
      }}
      role="dialog"
      aria-modal
      aria-label="Search"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl overflow-hidden rounded-[22px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
        style={{ visibility: "hidden" }}
        onKeyDown={handleKeyDown}
      >
        {/* ── Search input ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-black/[0.07] px-5 py-4">
          <Search size={18} className="shrink-0 text-[var(--muted)]" strokeWidth={2} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="min-w-0 flex-1 bg-transparent text-[1rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            aria-label={t.search.ariaLabel}
            aria-autocomplete="list"
            aria-controls={listId}
            autoComplete="off"
          />
          {/* Keyboard shortcut hint */}
          <kbd className="hidden shrink-0 rounded-[6px] border border-black/[0.1] bg-[#f5f5f5] px-2 py-1 text-[0.7rem] font-semibold text-[var(--muted)] sm:block">
            esc
          </kbd>
          <button
            type="button"
            onClick={closeSearch}
            aria-label={t.search.close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-black/[0.06]"
          >
            <X size={16} strokeWidth={2.2} className="text-[var(--muted)]" />
          </button>
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <div
          id={listId}
          role="listbox"
          className="hide-scrollbar max-h-[min(60vh,480px)] overflow-y-auto"
        >
          {/* Empty state */}
          {!hasQuery && (
            <div className="px-5 py-8 text-center">
              <p className="text-[0.88rem] text-[var(--muted)]">
                {t.search.noResultsHint}
              </p>
            </div>
          )}

          {/* No results for a query */}
          {hasQuery && !hasResults && (
            <div className="px-5 py-10 text-center">
              <p className="text-[0.95rem] font-semibold text-[var(--foreground)]">
                {t.search.noResults}
              </p>
              <p className="mt-1.5 text-[0.83rem] text-[var(--muted)]">
                {t.search.noResultsHint}
              </p>
            </div>
          )}

          {/* Products section */}
          {results.products.length > 0 && (
            <section className="px-3 py-3">
              <p className="mb-1.5 px-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                {t.search.productsHeading}
              </p>
              {results.products.map((product, i) => (
                <ResultItem
                  key={product.id}
                  result={product}
                  isActive={false}
                  onClose={closeSearch}
                  index={i}
                  listId={listId}
                />
              ))}
            </section>
          )}

          {/* Divider between sections */}
          {results.products.length > 0 && results.articles.length > 0 && (
            <div className="mx-5 border-t border-black/[0.05]" />
          )}

          {/* Articles section */}
          {results.articles.length > 0 && (
            <section className="px-3 py-3">
              <p className="mb-1.5 px-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                {t.search.articlesHeading}
              </p>
              {results.articles.map((article, i) => (
                <ResultItem
                  key={article.slug}
                  result={article}
                  isActive={false}
                  onClose={closeSearch}
                  index={results.products.length + i}
                  listId={listId}
                />
              ))}
            </section>
          )}

          {/* Bottom padding */}
          {hasResults && <div className="h-2" />}
        </div>

        {/* ── Footer hint ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 border-t border-black/[0.05] px-5 py-2.5">
          <span className="text-[0.72rem] text-[var(--muted)]">
            <kbd className="rounded border border-black/[0.1] bg-[#f5f5f5] px-1.5 py-0.5 font-mono text-[0.68rem]">↑</kbd>
            <kbd className="ml-1 rounded border border-black/[0.1] bg-[#f5f5f5] px-1.5 py-0.5 font-mono text-[0.68rem]">↓</kbd>
            <span className="ml-1.5">navigate</span>
          </span>
          <span className="text-[0.72rem] text-[var(--muted)]">
            <kbd className="rounded border border-black/[0.1] bg-[#f5f5f5] px-1.5 py-0.5 font-mono text-[0.68rem]">↵</kbd>
            <span className="ml-1.5">open</span>
          </span>
          <span className="text-[0.72rem] text-[var(--muted)]">
            <kbd className="rounded border border-black/[0.1] bg-[#f5f5f5] px-1.5 py-0.5 font-mono text-[0.68rem]">esc</kbd>
            <span className="ml-1.5">close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
