"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  /** Radius in px within which the magnetic pull activates. Default: 80 */
  radius?: number;
  /** Maximum translation in px at cursor centre. Default: 8 */
  maxShift?: number;
};

/**
 * MagneticButton — wraps any element and pulls it slightly toward the cursor
 * when the pointer is within `radius` pixels. Springs back with an elastic
 * easing when the cursor moves out of range.
 *
 * Disabled automatically on touch/coarse-pointer devices.
 * Uses gsap.quickTo() for high-frequency mousemove tracking (no tween storm).
 */
export default function MagneticButton({
  children,
  radius = 80,
  maxShift = 8,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = wrapRef.current;
    if (!el) return;

    // quickTo pre-creates the tween once — subsequent calls just update the
    // end value, eliminating per-frame tween creation/destruction overhead.
    const setX = gsap.quickTo(el, "x", { duration: 0.3, ease: "power2.out" });
    const setY = gsap.quickTo(el, "y", { duration: 0.3, ease: "power2.out" });

    let isNear = false;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        if (!isNear) isNear = true;
        const strength = (1 - dist / radius) * maxShift;
        const norm = dist === 0 ? 1 : dist;
        setX((dx / norm) * strength);
        setY((dy / norm) * strength);
      } else if (isNear) {
        isNear = false;
        // Spring back with elastic easing — create a one-off tween for the return.
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)", overwrite: true });
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [radius, maxShift]);

  return (
    <div ref={wrapRef} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}
