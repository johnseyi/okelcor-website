"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, ease } from "@/lib/gsap";

type DepthTiltOptions = {
  maxRotate?: number;
  maxShift?: number;
  scale?: number;
  desktopOnly?: boolean;
  glareSelector?: string;
};

/**
 * Lightweight pointer tilt for premium card depth.
 * Runs only on fine-pointer devices, respects reduced motion, and animates
 * transform/opacity only. No global animation loop is created.
 */
export function useDepthTilt<T extends HTMLElement>({
  maxRotate = 7,
  maxShift = 10,
  scale = 1.01,
  desktopOnly = true,
  glareSelector = "[data-depth-glare]",
}: DepthTiltOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (desktopOnly && !window.matchMedia("(min-width: 1024px)").matches) return;

    const el = ref.current;
    if (!el) return;

    const glare = el.querySelector<HTMLElement>(glareSelector);

    const rotateXTo = gsap.quickTo(el, "rotateX", {
      duration: 0.32,
      ease: ease.smooth,
      overwrite: true,
    });
    const rotateYTo = gsap.quickTo(el, "rotateY", {
      duration: 0.32,
      ease: ease.smooth,
      overwrite: true,
    });
    const xTo = gsap.quickTo(el, "x", {
      duration: 0.32,
      ease: ease.smooth,
      overwrite: true,
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 0.32,
      ease: ease.smooth,
      overwrite: true,
    });
    const scaleTo = gsap.quickTo(el, "scale", {
      duration: 0.32,
      ease: ease.smooth,
      overwrite: true,
    });

    const glareXTo = glare
      ? gsap.quickTo(glare, "xPercent", { duration: 0.45, ease: ease.smooth, overwrite: true })
      : null;
    const glareYTo = glare
      ? gsap.quickTo(glare, "yPercent", { duration: 0.45, ease: ease.smooth, overwrite: true })
      : null;
    const glareOpacityTo = glare
      ? gsap.quickTo(glare, "opacity", { duration: 0.3, ease: ease.smooth, overwrite: true })
      : null;

    gsap.set(el, {
      transformPerspective: 1200,
      transformStyle: "preserve-3d",
      willChange: "transform",
    });
    if (glare) {
      gsap.set(glare, { opacity: 0, willChange: "transform, opacity" });
    }

    const onEnter = () => {
      scaleTo(scale);
      glareOpacityTo?.(1);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      rotateXTo((0.5 - py) * maxRotate * 2);
      rotateYTo((px - 0.5) * maxRotate * 2);
      xTo((px - 0.5) * maxShift);
      yTo((py - 0.5) * maxShift);

      glareXTo?.((px - 0.5) * 18);
      glareYTo?.((py - 0.5) * 18);
    };

    const reset = () => {
      rotateXTo(0);
      rotateYTo(0);
      xTo(0);
      yTo(0);
      scaleTo(1);
      glareXTo?.(0);
      glareYTo?.(0);
      glareOpacityTo?.(0);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      gsap.set(el, { clearProps: "transform,willChange,transformPerspective,transformStyle" });
      if (glare) {
        gsap.set(glare, { clearProps: "transform,opacity,willChange" });
      }
    };
  }, [desktopOnly, glareSelector, maxRotate, maxShift, scale]);

  return ref;
}
