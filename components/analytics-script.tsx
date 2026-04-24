"use client";

import Script from "next/script";
import { useEffect } from "react";
import { getConsent, CONSENT_EVENT } from "@/lib/cookie-consent";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;

// Sync cookie-consent banner decisions into gtag consent state
function ConsentSync() {
  useEffect(() => {
    const sync = () => {
      if (typeof window.gtag !== "function") return;
      const granted = getConsent() === "accepted" ? "granted" : "denied";
      window.gtag("consent", "update", {
        analytics_storage:  granted,
        ad_storage:         granted,
        ad_user_data:       granted,
        ad_personalization: granted,
      });
    };

    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return null;
}

export default function AnalyticsScript() {
  // At least one ID must be set for the scripts to render
  if (!GA4_ID && !ADS_ID && !TAG_ID) return null;

  // The primary ID drives the gtag.js loader URL
  const primaryId = GA4_ID ?? ADS_ID ?? TAG_ID!;

  // Build the per-ID config calls
  const configs = [
    GA4_ID ? `gtag('config', '${GA4_ID}');` : "",
    ADS_ID ? `gtag('config', '${ADS_ID}');` : "",
    TAG_ID ? `gtag('config', '${TAG_ID}');` : "",
  ]
    .filter(Boolean)
    .join("\n  ");

  return (
    <>
      <ConsentSync />

      {/*
        1. Consent defaults — must run before gtag.js loads so Google
           receives the consent state on the very first hit.
      */}
      <Script id="gtag-consent-init" strategy="beforeInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
`}</Script>

      {/*
        2. Load the gtag.js library (async, afterInteractive).
           Uses GA4 ID as the primary loader param.
      */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />

      {/*
        3. Initialise and configure all three IDs after the library loads.
           Matches the standard Google tag snippet exactly.
      */}
      <Script id="gtag-config" strategy="afterInteractive">{`
gtag('js', new Date());
${configs}
`}</Script>
    </>
  );
}
