"use client";

import { useEffect, useRef } from "react";

/**
 * CustomCursor — replaces the default OS cursor with a small orange dot on
 * pointer-fine (desktop/mouse) devices. Automatically disabled on touch devices.
 *
 * - Position is updated inside a requestAnimationFrame loop so the cursor
 *   tracks the mouse with zero jitter regardless of React render cycles.
 * - Size/opacity changes on interactive elements (a, button) use CSS transitions
 *   so they feel snappy but still smooth.
 * - Adds/removes the "js-cursor-none" class on <body> to hide the native cursor.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate on true pointer devices (mouse/trackpad).
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    // ── State refs (avoids stale closures) ──────────────────────────────────
    const pos = { x: -100, y: -100 };
    // Half the current dot diameter — updated in hover handlers so the RAF
    // loop always centres the dot on the cursor tip without flicker.
    let halfSize = 5;
    let raf = 0;

    // ── Hide native cursor ───────────────────────────────────────────────────
    document.body.classList.add("js-cursor-none");

    // ── Track raw mouse position ─────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    // ── RAF render loop — position update is decoupled from mouse events ─────
    const loop = () => {
      dot.style.transform = `translate(${pos.x - halfSize}px, ${pos.y - halfSize}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // ── Scale up on interactive elements via event delegation ────────────────
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest("a, button")) {
        halfSize = 10;
        dot.style.width = "20px";
        dot.style.height = "20px";
        dot.style.opacity = "0.7";
      }
    };

    const onOut = (e: MouseEvent) => {
      const to = e.relatedTarget as Element | null;
      if (!to || !to.closest("a, button")) {
        halfSize = 5;
        dot.style.width = "10px";
        dot.style.height = "10px";
        dot.style.opacity = "1";
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.body.classList.remove("js-cursor-none");
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: "#E85C1A",
        pointerEvents: "none",
        zIndex: 99999,
        willChange: "transform",
        // Initial position off-screen until first mousemove fires
        transform: "translate(-100px, -100px)",
        // Transition only for size/opacity — NOT transform (that's driven by RAF)
        transition: "width 0.18s ease, height 0.18s ease, opacity 0.18s ease",
      }}
    />
  );
}
