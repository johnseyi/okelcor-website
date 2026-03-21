import type { Variants } from "framer-motion";

// ── Viewport defaults ─────────────────────────────────────────────────────────
// Shared across all whileInView animations — fire once, 60px before element enters
export const viewportOnce = { once: true, margin: "-60px" } as const;

// ── Variants ──────────────────────────────────────────────────────────────────

/** Fade up — primary section reveal */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Fade in — no vertical movement */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/** Stagger container — wraps staggerItem children */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

/** Stagger item — child of staggerContainer */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Accordion content height animation */
export const accordionContent: Variants = {
  collapsed: { height: 0, opacity: 0 },
  open: {
    height: "auto",
    opacity: 1,
    transition: { height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }, opacity: { duration: 0.2, delay: 0.05 } },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }, opacity: { duration: 0.15 } },
  },
};
