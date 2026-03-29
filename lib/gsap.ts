/**
 * lib/gsap.ts
 *
 * Central GSAP setup for the Okelcor website.
 * Import gsap, ScrollTrigger, useGSAP, and animation presets from here only.
 * Plugin registration is handled once here — never call registerPlugin elsewhere.
 * Import this ONLY from "use client" files — never from server components.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// ── Plugin registration ────────────────────────────────────────────────────────
// Guard prevents this running during SSR — Next.js client components still
// execute on the server for initial HTML generation.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);

  // Global defaults — applied to every tween unless overridden.
  // No overwrite default: each tween manages its own lifecycle explicitly.
  gsap.defaults({
    ease: "power2.out",
    duration: 0.6,
  });

  // ── Full-page-unload teardown ──────────────────────────────────────────────
  // Covers every hard-navigation path triggered by auth:
  //   • window.location.href = result.url  (post sign-in redirect)
  //   • signOut({ callbackUrl })           (navbar sign-out)
  //   • middleware 307 redirect            (unauthenticated → /auth)
  //
  // Without this, GSAP tweens keep ticking during the browser's unload
  // sequence, firing ScrollTrigger callbacks against a partially-torn-down
  // DOM and producing console errors on the incoming page.
  window.addEventListener("beforeunload", () => {
    ScrollTrigger.killAll();
    gsap.globalTimeline.clear();
  });
}

// ── Reduced motion ─────────────────────────────────────────────────────────────
/**
 * Returns true when the OS/browser has prefers-reduced-motion: reduce set.
 * All hooks and animations must check this before running significant motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ── Easing presets ─────────────────────────────────────────────────────────────
/**
 * Named easing presets aligned with the brand motion direction.
 * Use these everywhere instead of raw strings.
 *
 * smooth   → general transitions, subtle state changes
 * entrance → section and element reveals scrolling into view
 * drawer   → panels, menus, and side drawers sliding in/out
 * subtle   → micro-interactions, hover effects
 * sharp    → quick, decisive state changes (accordion, toggles)
 */
export const ease = {
  smooth:   "power2.out",
  entrance: "power3.out",
  drawer:   "expo.out",
  subtle:   "sine.inOut",
  sharp:    "power2.inOut",
} as const;

export type EaseKey = keyof typeof ease;

// ── ScrollTrigger shared defaults ─────────────────────────────────────────────
/**
 * Shared ScrollTrigger configuration used across reveal hooks.
 * "top 85%" fires when the element's top edge crosses 85% down the viewport.
 */
export const scrollDefaults = {
  start: "top 85%",
  toggleActions: "play none none none",
} as const;

// ── Re-exports ─────────────────────────────────────────────────────────────────
export { gsap, ScrollTrigger, useGSAP };
