"use client";

/**
 * hooks/useStagger.ts
 *
 * Scroll-triggered staggered entrance animation for groups of elements.
 *
 * Attach the returned ref to a container. When the container scrolls into view,
 * its direct children (or elements matching `selector`) animate in sequentially
 * with a cascading delay.
 *
 * Usage:
 *   const ref = useStagger({ stagger: 0.08 });
 *   return (
 *     <div ref={ref} className="grid grid-cols-3 gap-6">
 *       <Card /> <Card /> <Card />
 *     </div>
 *   );
 */

import { useRef } from "react";
import { gsap, useGSAP, ease, scrollDefaults, prefersReducedMotion } from "@/lib/gsap";

export interface UseStaggerOptions {
  /** Vertical travel distance (px) per item. Default 28. */
  y?: number;
  /** Tween duration per item, in seconds. Default 0.65. */
  duration?: number;
  /** Delay between each child animation starting, in seconds. Default 0.09. */
  stagger?: number;
  /** Delay before the first item starts animating. Default 0. */
  delay?: number;
  /**
   * CSS selector for the children to animate.
   * Default ":scope > *" — selects all direct children of the container.
   */
  selector?: string;
  /** ScrollTrigger start position. Default "top 85%". */
  start?: string;
}

export function useStagger<T extends HTMLElement = HTMLDivElement>(
  options: UseStaggerOptions = {}
) {
  const {
    y        = 28,
    duration = 0.65,
    stagger  = 0.09,
    delay    = 0,
    selector = ":scope > *",
    start    = scrollDefaults.start,
  } = options;

  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const container = ref.current;
      if (!container) return;

      const children = Array.from(container.querySelectorAll<HTMLElement>(selector));
      if (!children.length) return;

      const reduced = prefersReducedMotion();

      try {
        gsap.fromTo(
          children,
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
            stagger: reduced ? 0 : stagger,
            scrollTrigger: {
              trigger: container,
              start,
              toggleActions: scrollDefaults.toggleActions,
              once: true,
            },
          }
        );
      } catch {
        // Animation failed — snap all children to their final visible state.
        gsap.set(children, { clearProps: "opacity,y" });
      }

      // Unmount cleanup — children are queried fresh inside the effect so
      // we need to re-query them here for the clearProps call. The container
      // ref is still attached at this point (React removes nodes after effects).
      return () => {
        const els = Array.from(container.querySelectorAll<HTMLElement>(selector));
        if (els.length) gsap.set(els, { clearProps: "opacity,y" });
      };
    },
    { scope: ref, dependencies: [y, duration, stagger, delay, selector, start] }
  );

  return ref;
}
