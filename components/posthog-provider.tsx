"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// Captures a pageview on every client-side navigation (SPA route changes).
// Wrapped in Suspense by PostHogProvider below because useSearchParams
// requires a Suspense boundary in Next.js App Router.
function PageViewCapture() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url =
      window.origin +
      pathname +
      (searchParams.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!KEY || !HOST) return;
    posthog.init(KEY, {
      api_host:         HOST,
      person_profiles:  "identified_only",
      capture_pageview: false, // Handled by PageViewCapture below
      capture_pageleave: true,
    });
  }, []);

  // No key → render children unmodified, no tracking
  if (!KEY || !HOST) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewCapture />
      </Suspense>
      {children}
    </PHProvider>
  );
}
