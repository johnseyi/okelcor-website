"use client";

import Link from "next/link";
import { MessageSquareMore, ArrowUp, CircleDollarSign } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Crisp } from "crisp-sdk-web";

export default function FloatingBar() {
  const { t } = useLanguage();

  function openChat() {
    try {
      Crisp.chat.open();
    } catch {
      // Crisp not yet initialised (e.g. no NEXT_PUBLIC_CRISP_WEBSITE_ID set)
    }
  }

  return (
    <div className="sticky bottom-0 z-40 w-full border-t border-black/8 bg-[#f5f5f5] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 sm:gap-4">

        <button
          type="button"
          onClick={openChat}
          className="relative z-10 flex h-[48px] flex-1 items-center gap-3 rounded-full border border-black/10 bg-white/92 px-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
        >
          <MessageSquareMore size={18} className="text-[var(--muted)]" />
          <span className="w-full cursor-pointer bg-transparent text-[14px] text-[var(--muted)]">
            {t.floating.placeholder}
          </span>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[0_10px_20px_rgba(244,81,30,0.24)]"
            aria-hidden="true"
          >
            <ArrowUp size={16} />
          </span>
        </button>

        <Link
          href="/quote"
          className="relative z-10 flex h-[48px] min-w-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(244,81,30,0.28)] transition hover:bg-[var(--primary-hover)] sm:px-5"
        >
          <CircleDollarSign size={18} />
          <span className="hidden sm:inline">{t.floating.cta}</span>
        </Link>

      </div>
    </div>
  );
}
