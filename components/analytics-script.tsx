"use client";

import Script from "next/script";
import { useEffect } from "react";
import { getConsent, CONSENT_EVENT } from "@/lib/cookie-consent";

const GA_ID  = process.env.NEXT_PUBLIC_GA_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;

function ConsentSync() {
  useEffect(() => {
    const sync = () => {
      if (typeof window.gtag !== "function") return;
      const granted = getConsent() === "accepted" ? "granted" : "denied";
      window.gtag("consent", "update", {
        analytics_storage:   granted,
        ad_storage:          granted,
        ad_user_data:        granted,
        ad_personalization:  granted,
      });
    };

    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return null;
}

export default function AnalyticsScript() {
  if (!GA_ID && !ADS_ID) return null;

  const primaryId = GA_ID ?? ADS_ID!;

  const extraConfigs = [
    GA_ID  ? `gtag('config', '${GA_ID}',  { send_page_view: true });` : "",
    ADS_ID ? `gtag('config', '${ADS_ID}');` : "",
    TAG_ID ? `gtag('config', '${TAG_ID}');` : "",
  ]
    .filter(Boolean)
    .join("\n        ");

  return (
    <>
      <ConsentSync />

      <Script id="gtag-consent-init" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('consent', 'default', {
          analytics_storage:  'denied',
          ad_storage:         'denied',
          ad_user_data:       'denied',
          ad_personalization: 'denied',
          wait_for_update: 500
        });
        ${extraConfigs}
      `}</Script>

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
