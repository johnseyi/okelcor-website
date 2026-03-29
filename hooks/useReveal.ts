"use client";

/**
 * hooks/useReveal.ts
 *
 * Scroll-triggered fade + slide-up entrance animation.
 *
 * Attach the returned ref to any element. When that element scrolls into
 * view it fades in and rises from a small vertical offset. Fires once.
 *
 * Usage:
 *   const ref = useReveal({ delay: 0.1 });
 *   return <section ref={ref}>…</section>;
 */

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, ease, scrollDefaults, prefersReducedMotion } from "@/lib/gsap";

export interface UseRevealOptions {
  /** Vertical distance (px) the element travels upward on reveal. Default 32. */
  y?: number;
  /** Tween duration in seconds. Default 0.7. */
  duration?: number;
  /** Delay before the tween starts, in seconds. Default 0. */
  delay?: number;
  /** ScrollTrigger start position. Default "top 85%". */
  start?: string;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {}
) {
  const {
    y        = 32,
    duration = 0.7,
    delay    = 0,
    start    = scrollDefaults.start,
  } = options;

  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduced = prefersReducedMotion();

      try {
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: reduced ? 0 : y,
          },
          {
            opacity: 1,
            y: 0,
            duration: reduced ? 0.01 : duration,
            delay,
            ease: ease.entrance,
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: scrollDefaults.toggleActions,
              once: true,
            },
          }
        );
      } catch {
        // Animation failed — snap element to its final visible state so
        // content is never left hidden due to a GSAP error.
        gsap.set(el, { clearProps: "opacity,y" });
      }

      // Unmount cleanup — runs when the component leaves the tree (e.g.
      // during client-side route navigation or an auth redirect).
      // context.revert() kills the tween but does NOT clear inline styles,
      // so the element would stay frozen at opacity:0 until React removes
      // the node. Clearing props here snaps it to its natural CSS state,
      // preventing a flash of invisible content during the navigation.
      return () => gsap.set(el, { clearProps: "opacity,y" });
    },
    { scope: ref, dependencies: [y, duration, delay, start] }
  );

  return ref;
}
