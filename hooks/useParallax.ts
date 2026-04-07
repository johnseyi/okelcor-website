"use client";

/**
 * hooks/useParallax.ts
 *
 * Scroll-scrubbed parallax effect for background images or decorative layers.
 *
 * Returns two refs:
 *   containerRef → attach to the outer section/wrapper that defines the scroll range
 *   targetRef    → attach to the element that should move (typically the bg image div)
 *
 * Keep speed between 0.1 and 0.4 for a subtle, premium feel.
 *
 * Usage:
 *   const { containerRef, targetRef } = useParallax({ speed: 0.2 });
 *   return (
 *     <section ref={containerRef}>
 *       <div ref={targetRef} style={{ backgroundImage: "url(...)" }} />
 *     </section>
 *   );
 */

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export interface UseParallaxOptions {
  /**
   * Movement intensity as a fraction of the container height.
   * 0.2 = target moves 20% of container height over the full scroll range.
   * Default 0.2. Keep ≤ 0.35 to avoid revealing empty edges.
   */
  speed?: number;
  /** ScrollTrigger start. Default "top bottom". */
  start?: string;
  /** ScrollTrigger end. Default "bottom top". */
  end?: string;
}

export function useParallax<T extends HTMLElement = HTMLDivElement>(
  options: UseParallaxOptions = {}
) {
  const {
    speed = 0.2,
    start = "top bottom",
    end   = "bottom top",
  } = options;

  const containerRef = useRef<T>(null);
  const targetRef    = useRef<T>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const target    = targetRef.current;

      if (!container || !target || prefersReducedMotion()) return;

      try {
        gsap.fromTo(
          target,
          { yPercent: -(speed * 50) },
          {
            yPercent: speed * 50,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start,
              end,
              scrub: 0.8,
            },
          }
        );
      } catch {
        // Animation failed — clear any transform so the element renders normally.
        gsap.set(target, { clearProps: "yPercent" });
      }

      // Unmount cleanup — reset the parallax transform so the element is not
      // left at an offset yPercent during client-side route navigation.
      return () => gsap.set(target, { clearProps: "yPercent" });
    },
    { scope: containerRef, dependencies: [speed, start, end] }
  );

  return { containerRef, targetRef };
}
