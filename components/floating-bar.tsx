"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquareMore, ArrowUp, CircleDollarSign } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export default function FloatingBar() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/quote");
  };

  return (
    <div className="sticky bottom-0 z-40 w-full border-t border-black/8 bg-[#f5f5f5] py-3">
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-3 sm:gap-4 sm:px-4">

        <form
          onSubmit={handleSubmit}
          className="flex h-[48px] flex-1 items-center gap-3 rounded-full border border-black/10 bg-white px-4"
        >
          <MessageSquareMore size={18} className="text-[var(--muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.floating.placeholder}
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--muted)]"
          />
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            aria-label="Submit inquiry"
          >
            <ArrowUp size={16} />
          </button>
        </form>

        <Link
          href="/quote"
          className="flex h-[48px] shrink-0 items-center gap-2 rounded-full bg-[var(--primary)] px-4 text-[14px] font-semibold text-white transition hover:bg-[var(--primary-hover)] sm:px-5"
        >
          <CircleDollarSign size={18} />
          <span className="hidden sm:inline">{t.floating.cta}</span>
        </Link>

      </div>
    </div>
  );
}
