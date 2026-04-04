"use client";

/**
 * components/motion/fade-up.tsx
 *
 * Reusable scroll-reveal wrapper — pure CSS transition, no external library.
 * Uses IntersectionObserver to add `.is-visible` when the element enters the
 * viewport. The CSS in globals.css drives the actual animation:
 *   opacity 0 → 1, translateY(20px) → 0, 0.6s ease.
 *
 * Respects prefers-reduced-motion via a CSS media query in globals.css.
 * Disconnects the observer after the first intersection (animates once).
 */

import { useEffect, useRef } from "react";

interface FadeUpProps {
  children: React.ReactNode;
  /** Extra classes forwarded to the wrapper div. */
  className?: string;
  /** Optional stagger delay in milliseconds. */
  delay?: number;
  /** Fraction of the element that must be visible before triggering (0–1). */
  threshold?: number;
}

export default function FadeUp({
  children,
  className,
  delay = 0,
  threshold = 0.1,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          // Clean up delay after animation completes so it doesn't re-apply
          // if the element is somehow re-animated in the future.
          if (delay > 0) {
            el.addEventListener(
              "transitionend",
              () => { el.style.transitionDelay = ""; },
              { once: true }
            );
          }
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={`fade-up${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
