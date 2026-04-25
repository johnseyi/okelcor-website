"use client";
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const rafRef  = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (target === fromRef.current) return;
    const from  = fromRef.current;
    const start = performance.now();

    const tick = (now: number) => {
      const t      = Math.min((now - start) / duration, 1);
      const eased  = 1 - Math.pow(1 - t, 3);
      const next   = Math.round(from + (target - from) * eased);
      setValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}
