import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Typography — Swiss industrial grotesque + technical mono.
 *
 * The site previously ran on the raw system stack, so it rendered as SF Pro on
 * macOS, Segoe UI on Windows and Roboto on Android — no typographic identity at
 * all, and a different brand on every operating system.
 *
 * The font files are vendored in `app/fonts/` and loaded with
 * `next/font/local`, so nothing is fetched from Google at build time OR at
 * runtime. That matters here specifically: the Munich Regional Court has held
 * that serving Google Fonts from Google's own servers breaches GDPR by
 * transmitting the visitor's IP address. Okelcor is Munich-based.
 *
 * Vendoring rather than `next/font/google` also removes a network dependency
 * from the build itself — CI cannot fail or stall because a font CDN is slow.
 *
 * Both are variable fonts: one file covers weights 100–900 and the browser
 * interpolates. `size-adjust` and the matched fallback metrics below mean the
 * swap from fallback to Geist does not shift layout, so CLS is protected
 * rather than risked.
 */
const sans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-geist-sans",
  display: "swap",
  // Metric-matched to the previous system stack so the pre-swap render
  // occupies the same space as the final one.
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: "Arial",
});

/**
 * Mono is not decorative here. Tyre sizes (`315/80 R22.5`), service
 * descriptions (`91V`), DOT stamps, SKUs and the REX registration number are
 * measurements, and a fixed-width face makes them read as measurements —
 * figures align down a column in the compare table instead of drifting.
 */
const mono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-geist-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});
import { CartProvider } from "@/context/cart-context";
import { CompareProvider } from "@/context/compare-context";
import CompareBar from "@/components/shop/compare-bar";
import CompareModal from "@/components/shop/compare-modal";
import { LanguageProvider } from "@/context/language-context";
import CartDrawer from "@/components/cart/cart-drawer";
import CookieConsent from "@/components/cookie-consent";
import BackToTop from "@/components/back-to-top";
import AnalyticsScript from "@/components/analytics-script";
import { SearchProvider } from "@/context/search-context";
import SearchModal from "@/components/search/search-modal";
import { SITE_URL as SITE_URL_FALLBACK } from "@/lib/constants";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { SiteSettingsProvider } from "@/context/site-settings-context";
import { getSiteSettings } from "@/lib/site-settings";
import { getServerLocale } from "@/lib/locale";
import CrispChat from "@/components/crisp-chat";
import AnnouncementBar from "@/components/announcement-bar";
import PostHogProvider from "@/components/posthog-provider";

const SITE_URL = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL || SITE_URL_FALLBACK);
  } catch {
    return new URL(SITE_URL_FALLBACK);
  }
})();

const BASE_URL = SITE_URL.href;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.okelcor.com"),
  title: {
    default: "OKELCOR TIRES - The Cheapest Tyres on the Internet",
    template: "%s | Okelcor Tires",
  },
  description:
    "Munich-based global tyre supplier. Premium PCR, TBR, and used tyres for businesses, fleets, and individual drivers in over 30 countries.",
  keywords: ["tyres", "tires", "wholesale", "PCR", "TBR", "bulk tires", "Okelcor"],
  openGraph: {
    type: "website",
    siteName: "Okelcor Tires",
    locale: "en_GB",
    url: "https://www.okelcor.com",
    title: "OKELCOR TIRES - The Cheapest Tyres on the Internet",
    description:
      "Munich-based global tyre supplier. Premium PCR, TBR, and used tyres for businesses, fleets, and individual drivers in over 30 countries.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OKELCOR TIRES - The Cheapest Tyres on the Internet",
    description:
      "Munich-based global tyre supplier. Premium PCR, TBR, and used tyres for businesses, fleets, and individual drivers in over 30 countries.",
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, locale] = await Promise.all([getSiteSettings(), getServerLocale()]);

  return (
    <html lang={locale} className={`w-full ${sans.variable} ${mono.variable}`}>
      <body className="m-0 w-full p-0">
        {/* ── Site-wide structured data ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Okelcor",
                legalName: "Okelcor GmbH",
                url: "https://www.okelcor.com",
                logo: "https://www.okelcor.com/logo/okelcor-logo.png",
                description:
                  "Munich-based global tyre supplier delivering PCR, TBR, and used tyres to wholesalers and distributors in over 30 countries.",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Landsberger Str. 155",
                  addressLocality: "Munich",
                  postalCode: "80687",
                  addressCountry: "DE",
                },
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+49-89-545-583-60",
                  contactType: "sales",
                  email: "support@okelcor.com",
                  areaServed: "Worldwide",
                },
                vatID: "DE343138173",
                sameAs: ["https://okelcor.com"],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Okelcor Tires",
                url: "https://www.okelcor.com",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      "https://www.okelcor.com/shop?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <PostHogProvider>
        <CustomerAuthProvider>
          <SiteSettingsProvider settings={settings}>
            <LanguageProvider>
              <SearchProvider>
                <CartProvider>
                <CompareProvider>
                  <AnnouncementBar />
                  {children}
                  <CartDrawer />
                  <SearchModal />
                  <CompareBar />
                  <CompareModal />
                  <CookieConsent />
                  <BackToTop />
                  <AnalyticsScript />
                  <CrispChat />
                </CompareProvider>
                </CartProvider>
              </SearchProvider>
            </LanguageProvider>
          </SiteSettingsProvider>
        </CustomerAuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
