"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ShopPromotion = {
  id: number;
  title: string;
  subheadline?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  image_url?: string | null;
  placement?: string | null;
};

const ROTATE_MS = 5000;

export default function ShopPromoBanner({
  promotions,
}: {
  promotions: ShopPromotion[];
}) {
  const [idx, setIdx]   = useState(0);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (promotions.length <= 1) return;
    timerRef.current = setInterval(
      () => setIdx((i) => (i + 1) % promotions.length),
      ROTATE_MS
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [promotions.length]);

  if (promotions.length === 0) return null;

  const promo   = promotions[idx];
  const hasImg  = !!promo.image_url;
  const hasCta  = !!(promo.button_text && promo.button_link);

  const prev = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIdx((i) => (i - 1 + promotions.length) % promotions.length);
  };

  const next = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIdx((i) => (i + 1) % promotions.length);
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#f4511e]/20 bg-gradient-to-r from-[#fff8f6] to-white shadow-sm">
      <div className="relative flex h-[96px] items-center sm:h-[108px]">

        {/* Left image */}
        {hasImg && (
          <div className="relative h-full w-[110px] shrink-0 overflow-hidden sm:w-[140px]">
            <Image
              src={promo.image_url!}
              alt={promo.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#fff8f6]/60" />
          </div>
        )}

        {/* Text */}
        <div className={`min-w-0 flex-1 py-3 ${hasImg ? "pl-4 pr-3" : "px-5"}`}>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#f4511e]">
            Special Offer
          </p>
          <p className="mt-0.5 truncate text-[0.9rem] font-bold text-[#171a20] sm:text-[0.95rem]">
            {promo.title}
          </p>
          {promo.subheadline && (
            <p className="mt-0.5 truncate text-[0.78rem] text-[#5c5e62]">
              {promo.subheadline}
            </p>
          )}
        </div>

        {/* CTA button */}
        {hasCta && (
          <div className="shrink-0 pr-4">
            <Link
              href={promo.button_link!}
              className="inline-flex h-9 items-center rounded-full bg-[#f4511e] px-5 text-[0.8rem] font-bold text-white shadow-sm transition hover:bg-[#e04018] active:scale-[0.97]"
            >
              {promo.button_text}
            </Link>
          </div>
        )}

        {/* Multi-promo nav arrows */}
        {promotions.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              className="absolute left-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/10 transition hover:bg-black/20"
            >
              <ChevronLeft size={13} className="text-[#171a20]" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className={`absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/10 transition hover:bg-black/20 ${hasCta ? "right-[calc(var(--cta-w,130px)+8px)]" : "right-1.5"}`}
            >
              <ChevronRight size={13} className="text-[#171a20]" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {promotions.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1">
            {promotions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${
                  i === idx ? "h-1.5 w-4 bg-[#f4511e]" : "h-1.5 w-1.5 bg-[#e5e7eb]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
