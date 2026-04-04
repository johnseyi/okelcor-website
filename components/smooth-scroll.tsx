"use client";

/**
 * components/smooth-scroll.tsx
 *
 * Initialises Lenis smooth scrolling once on mount and keeps it ticking
 * via requestAnimationFrame. Cleans up on unmount.
 *
 * Lenis intercepts native wheel/touch events and replaces them with its
 * own lerp-based scroll, giving the buttery feel seen on premium sites.
 *
 * Mounted once in app/layout.tsx so it covers the entire site.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;

    const lenis = new Lenis({
      duration: 1.2,       // scroll animation duration in seconds
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
      smoothWheel: true,   // smooth mouse wheel
      touchMultiplier: 1.5, // slightly faster on touch devices
    });

    let raf: number;

    function tick(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [isAdminRoute]);

  // Renders nothing — purely behavioural
  return null;
}
