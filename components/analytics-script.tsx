"use client";

/**
 * components/analytics-script.tsx
 *
 * Consent-aware Google Analytics 4 loader.
 *
 * Behaviour:
 *   1. Initialises the dataLayer and sets GA4 consent defaults to "denied"
 *      BEFORE the main gtag.js script loads (GDPR-safe by default).
 *   2. Loads gtag.js after the page is interactive (non-blocking).
 *   3. Listens to the site-wide CONSENT_EVENT. When the user accepts
 *      cookies, consent is upgraded to "granted" and GA4 starts collecting.
 *   4. On mount, checks localStorage for a prior consent decision so
 *      returning visitors who already accepted are immediately enabled.
 *
 * Requires env var: NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 * If the var is absent the component renders nothing and is completely inert.
 */

import Script from "next/script";
import { useEffect } from "react";
import { getConsent, CONSENT_EVENT } from "@/lib/cookie-consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** Headless component — syncs our cookie-consent state into GA4 consent API. */
function ConsentSync() {
  useEffect(() => {
    const sync = () => {
      if (typeof window.gtag !== "function") return;
      const consent = getConsent();
      window.gtag("consent", "update", {
        analytics_storage: consent === "accepted" ? "granted" : "denied",
      });
    };

    // Sync on mount: handles returning visitors who already decided.
    sync();

    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return null;
}

export default function AnalyticsScript() {
  if (!GA_ID) return null;

  return (
    <>
      {/* ConsentSync handles the runtime consent ↔ gtag bridge */}
      <ConsentSync />

      {/*
        Inline init: runs before gtag.js so consent defaults are in place
        before GA4 fires any events. strategy="beforeInteractive" hoists
        this into <head> in the Next.js App Router.
      */}
      <Script id="ga4-consent-init" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          wait_for_update: 500
        });
        gtag('config', '${GA_ID}', { send_page_view: true });
      `}</Script>

      {/* Main GA4 script — loads after hydration, non-blocking */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
