"use client";

/**
 * components/motion/reveal.tsx
 *
 * Scroll-triggered fade + slide-up wrapper powered by GSAP.
 * Drop-in replacement for the previous Framer Motion version.
 * Public API is unchanged — all existing usages continue to work.
 *
 * Usage:
 *   <Reveal>
 *     <MySectionContent />
 *   </Reveal>
 *
 *   <Reveal delay={0.15} y={40}>
 *     <MySectionContent />
 *   </Reveal>
 */

import { useReveal } from "@/hooks/useReveal";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Delay before animation starts (seconds). Default 0. */
  delay?: number;
  /** Vertical travel distance (px). Default 32. */
  y?: number;
};

export default function Reveal({ children, className, delay, y }: Props) {
  const ref = useReveal<HTMLDivElement>({ delay, y });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
