import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { LanguageProvider } from "@/context/language-context";
import CartDrawer from "@/components/cart/cart-drawer";
import CookieConsent from "@/components/cookie-consent";
import BackToTop from "@/components/back-to-top";
import AnalyticsScript from "@/components/analytics-script";
import { SearchProvider } from "@/context/search-context";
import SearchModal from "@/components/search/search-modal";
import { SITE_URL as SITE_URL_FALLBACK } from "@/lib/constants";
import AuthSessionProvider from "@/components/auth/session-provider";

const SITE_URL = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL || SITE_URL_FALLBACK);
  } catch {
    return new URL(SITE_URL_FALLBACK);
  }
})();

const BASE_URL = SITE_URL.href;

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "Okelcor – Growing Together",
    template: "%s – Okelcor",
  },
  description:
    "Premium tyre sourcing solutions for distributors and wholesalers worldwide. PCR, TBR, and used tyres from trusted global brands.",
  openGraph: {
    type: "website",
    siteName: "Okelcor",
    locale: "en_GB",
    url: BASE_URL,
    title: "Okelcor – Growing Together",
    description:
      "Premium tyre sourcing solutions for distributors and wholesalers worldwide. PCR, TBR, and used tyres from trusted global brands.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Okelcor – Growing Together",
    description:
      "Premium tyre sourcing solutions for distributors and wholesalers worldwide.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <LanguageProvider>
            <SearchProvider>
              <CartProvider>
                {children}
                <CartDrawer />
                <SearchModal />
                <CookieConsent />
                <BackToTop />
                <AnalyticsScript />
              </CartProvider>
            </SearchProvider>
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}