import { Suspense } from "react";
import type { Metadata } from "next";
import { getServerLocale } from "@/lib/locale";
import { getPageMeta } from "@/lib/metadata-i18n";
import Navbar from "@/components/navbar";
import QuoteCta from "@/components/home/quote-cta";
import Footer from "@/components/footer";
import TradeTopBar from "@/components/home/trade-topbar";
import HeroFinder from "@/components/home/hero-finder";
import TrustStrip from "@/components/home/trust-strip";
import FetBand from "@/components/home/fet-band";
import RangeTiles from "@/components/home/range-tiles";
import BrandsSection from "@/components/home/brands-section";
import HowItWorks from "@/components/home/how-it-works";
import { BrandsSkeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const m = getPageMeta("home", locale);
  return {
    title: { absolute: m.title },
    description: m.description,
    openGraph: {
      title: m.ogTitle,
      description: m.ogDescription,
      url: "https://www.okelcor.com",
      type: "website",
    },
    twitter: {
      title: m.twitterTitle,
      description: m.twitterDescription,
    },
  };
}

export default function Home() {
  /*
   * Eight blocks, each earning its place — down from fourteen sections, a
   * scroll-progress bar, a flag marquee and a delayed popup. The shape is
   * the one every working tyre platform converges on: the finder first,
   * concrete trust facts second, then straight into the catalogue.
   */
  return (
    <main className="w-full">
      <TradeTopBar />
      <Navbar />

      {/* The finder is the hero — a buyer arrives knowing a sidewall size */}
      <HeroFinder />

      {/* Checkable facts, not adjectives */}
      <TrustStrip />

      {/* Into the catalogue: the four ranges, then the brands we carry */}
      <RangeTiles />
      <Suspense fallback={<BrandsSkeleton />}>
        <BrandsSection />
      </Suspense>

      {/* How a first order works — genuinely useful to a new B2B buyer */}
      <HowItWorks />

      {/* The second product line, said once, calmly — no popup */}
      <FetBand />

      <QuoteCta />
      <Footer />
    </main>
  );
}
