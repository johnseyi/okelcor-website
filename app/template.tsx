"use client";

/**
 * app/template.tsx
 *
 * Next.js template wrapper — re-mounts on every route change (unlike layout.tsx).
 *
 * No page-level opacity animation — section-level Reveal / StaggerParent components
 * handle all entrance motion. Wrapping the page in an opacity fade caused content
 * to appear blank for ~1 second on every navigation.
 *
 * ScrollTrigger.refresh() is called after each route mount so scroll positions
 * are recalculated for the incoming page. This is especially important after
 * auth redirects: the user lands on a page with a different height and GSAP's
 * cached scroll measurements from the previous page are no longer valid.
 */

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Recalculate all ScrollTrigger positions after the new page renders.
    // requestAnimationFrame defers until after the first paint so all
    // useGSAP hooks have registered their ScrollTriggers before we refresh.
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return <>{children}</>;
}
