"use client";

/**
 * components/hero.tsx
 *
 * Homepage hero slider — GSAP-powered, i18n-aware.
 *
 * Animation architecture:
 *   useGSAP (mount, once)           — entrance timeline + ScrollTrigger parallax
 *   useEffect (dependencies: [index]) — slide transition timeline with cleanup
 *
 * Background layers are all pre-rendered and GSAP controls opacity.
 * This avoids AnimatePresence DOM mounting overhead and enables clean crossfades.
 *
 * i18n: slide titles and subtitles come from useLanguage() → t.hero.slides[index].
 * CTA button labels come from t.hero.ctaPrimary / t.hero.ctaSecondary.
 * React re-renders the text content automatically when locale or index changes;
 * GSAP only controls opacity/position — it does not touch the text values.
 */

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP, ease, prefersReducedMotion } from "@/lib/gsap";
import { useLanguage } from "@/context/language-context";

// ── Slide images ───────────────────────────────────────────────────────────────
// Text content (title/subtitle) is sourced from translations; images are static.
const SLIDE_IMAGES = [
  "/sections/tyre-bg-light.png",
  "/sections/used-tyres.jpg",
  "/images/tyre-primary.jpg",
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function Hero() {
  const { t } = useLanguage();

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ── DOM refs ────────────────────────────────────────────────────────────────
  const sectionRef     = useRef<HTMLElement>(null);
  const bgContainerRef = useRef<HTMLDivElement>(null);
  const bgRefs         = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef       = useRef<HTMLHeadingElement>(null);
  const subtitleRef    = useRef<HTMLParagraphElement>(null);
  const buttonsRef     = useRef<HTMLDivElement>(null);

  // ── Animation state refs ────────────────────────────────────────────────────
  // prevIndexRef: the slide we're transitioning FROM
  // isFirstRender: skip slide-transition useEffect on initial mount
  const prevIndexRef  = useRef(0);
  const isFirstRender = useRef(true);

  // ── Autoplay ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => {
        prevIndexRef.current = prev;
        return prev === SLIDE_IMAGES.length - 1 ? 0 : prev + 1;
      });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goTo = (next: number) => {
    prevIndexRef.current = index;
    setIndex(next);
  };

  const goPrev = () => goTo(index === 0 ? SLIDE_IMAGES.length - 1 : index - 1);
  const goNext = () => goTo(index === SLIDE_IMAGES.length - 1 ? 0 : index + 1);

  // ── Mount animation + parallax ──────────────────────────────────────────────
  // Runs once. Sets up entrance timeline and persistent ScrollTrigger.
  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      // All bg layers start invisible (also set via inline style below as SSR fallback)
      bgRefs.current.forEach((el) => {
        if (el) gsap.set(el, { opacity: 0 });
      });

      if (reduced) {
        if (bgRefs.current[0]) gsap.set(bgRefs.current[0], { opacity: 1 });
        return;
      }

      try {
        // ── Entrance timeline ──────────────────────────────────────────────
        // Premium first impression: background settles in, then content cascades down
        const tl = gsap.timeline();

        tl
          // 1. Background fades in + scale settles
          .fromTo(
            bgRefs.current[0],
            { opacity: 0, scale: 1.07 },
            { opacity: 1, scale: 1.04, duration: 1.6, ease: ease.smooth }
          )
          // 2. Headline rises up
          .fromTo(
            titleRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: ease.entrance },
            "-=0.85"
          )
          // 3. Subtitle follows
          .fromTo(
            subtitleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.65, ease: ease.entrance },
            "-=0.55"
          )
          // 4. CTA buttons last
          .fromTo(
            buttonsRef.current,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.55, ease: ease.entrance },
            "-=0.45"
          );

        // ── Parallax ──────────────────────────────────────────────────────
        // Background container drifts upward as user scrolls past the hero.
        if (bgContainerRef.current && sectionRef.current) {
          gsap.to(bgContainerRef.current, {
            y: 80,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.5,
            },
          });
        }
      } catch {
        // Entrance animation failed — snap all hero elements to their final
        // visible states so the hero is never left as a blank section.
        bgRefs.current.forEach((el, i) => {
          if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0, scale: 1.04 });
        });
        gsap.set(
          [titleRef.current, subtitleRef.current, buttonsRef.current].filter(Boolean),
          { clearProps: "opacity,y" }
        );
      }
    },
    { scope: sectionRef }
  );

  // ── Slide transition ────────────────────────────────────────────────────────
  // Fires on every index change after the initial mount.
  // Cleanup kills the in-progress timeline if user navigates before it finishes.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const reduced = prefersReducedMotion();
    const prev    = prevIndexRef.current;
    const curr    = index;

    if (reduced) {
      bgRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { opacity: i === curr ? 1 : 0 });
      });
      return;
    }

    const tl = gsap.timeline();

    // Step 1: Hide text (React has already updated it with new slide content)
    tl.set(
      [titleRef.current, subtitleRef.current, buttonsRef.current],
      { opacity: 0, y: 10 }
    );

    // Step 2: Crossfade background layers
    tl.to(bgRefs.current[prev], { opacity: 0, duration: 0.9, ease: ease.smooth }, 0)
      .to(bgRefs.current[curr], { opacity: 1, duration: 0.9, ease: ease.smooth }, 0);

    // Step 3: Cascade text in during/after bg crossfade
    tl.to(
        titleRef.current,
        { opacity: 1, y: 0, duration: 0.6, ease: ease.entrance },
        0.2
      )
      .to(
        subtitleRef.current,
        { opacity: 1, y: 0, duration: 0.5, ease: ease.entrance },
        0.32
      )
      .to(
        buttonsRef.current,
        { opacity: 1, y: 0, duration: 0.45, ease: ease.entrance },
        0.42
      );

    return () => {
      tl.kill();
    };
  }, [index]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const slideText = t.hero.slides[index];

  return (
    <section ref={sectionRef} className="w-full pt-20">
      <div className="relative h-[82vh] min-h-[460px] max-h-[700px] overflow-hidden sm:min-h-[520px] md:h-[77vh] md:min-h-[560px] md:max-h-[720px]">

        {/*
          Background layers — all slides pre-rendered as stacked divs.
          GSAP controls opacity for crossfading; only one is visible at a time.
          opacity: 0 in inline style prevents a flash before GSAP's first tick.
          scale-[1.06] gives the parallax container room to shift without edges.
        */}
        <div
          ref={bgContainerRef}
          className="absolute inset-0 will-change-transform"
          aria-hidden="true"
        >
          {SLIDE_IMAGES.map((src, i) => (
            <div
              key={src}
              ref={(el) => {
                bgRefs.current[i] = el;
              }}
              className="absolute inset-0 scale-[1.06] bg-cover bg-center"
              style={{
                backgroundImage: `url("${src}")`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        {/* Overlay — softens image contrast for text legibility */}
        <div className="absolute inset-0 bg-black/24" aria-hidden="true" />

        {/* Left arrow */}
        <button
          type="button"
          onClick={goPrev}
          className="hero-nav-btn absolute left-8 top-1/2 z-20 hidden -translate-y-1/2 md:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={goNext}
          className="hero-nav-btn absolute right-8 top-1/2 z-20 hidden -translate-y-1/2 md:flex"
          aria-label="Next slide"
        >
          <ChevronRight size={22} strokeWidth={2} />
        </button>

        {/* Text content — i18n-aware */}
        <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-6 pt-8 text-center md:px-10 md:pb-8 md:pt-12">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center">

              <h1 ref={titleRef} className="hero-title max-w-5xl text-white">
                {slideText.title}
              </h1>

              <p
                ref={subtitleRef}
                className="hero-subtitle mt-3 max-w-4xl text-white"
              >
                {slideText.subtitle}
              </p>

              <div
                ref={buttonsRef}
                className="mt-6 flex flex-wrap justify-center gap-3"
              >
                <Link href="/quote" className="tesla-hero-btn-primary">
                  {t.hero.ctaPrimary}
                </Link>
                <Link href="/shop" className="tesla-hero-btn-secondary">
                  {t.hero.ctaSecondary}
                </Link>
              </div>

            </div>
          </div>

          {/* Pause control + pagination dots */}
          <div className="flex w-full items-end justify-between">
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="hero-control-btn hidden md:inline-flex"
              aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>

            <div className="mx-auto flex items-center gap-3">
              {SLIDE_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`hero-dot ${i === index ? "hero-dot-active" : ""}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Spacer — balances the pause button on the left */}
            <div className="hidden w-[42px] md:block" />
          </div>
        </div>

      </div>
    </section>
  );
}
