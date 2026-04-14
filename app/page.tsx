import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import WhyOkelcor from "@/components/why-okelcor";
import FadeUp from "@/components/motion/fade-up";
import Logistics from "@/components/logistics";
import WhoWeServeSection from "@/components/who-we-serve";
import TyreHighlightsSection from "@/components/tyre-highlights";
import RexCertified from "@/components/rex-certified";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";
import FloatingBar from "@/components/floating-bar";
import HeroSection from "@/components/home/hero-section";
import CategoriesSection from "@/components/home/categories-section";
import BrandsSection from "@/components/home/brands-section";
import FetTeaser from "@/components/fet-teaser";
import {
  HeroSkeleton,
  CategoriesSkeleton,
  BrandsSkeleton,
} from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Okelcor – Growing Together",
  description:
    "Munich-based global tyre supplier. Premium PCR, TBR, and used tyres for businesses, fleets, and individual drivers in over 30 countries.",
  openGraph: {
    title: "Okelcor – Growing Together",
    description:
      "Munich-based global tyre supplier. Premium PCR, TBR, and used tyres for businesses, fleets, and individual drivers in over 30 countries.",
    url: "/",
    type: "website",
  },
  twitter: {
    title: "Okelcor – Growing Together",
    description:
      "Munich-based global tyre supplier. PCR, TBR, and used tyres for distributors worldwide.",
  },
};

export default function Home() {
  return (
    <main className="w-full">
      <Navbar />

      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>

      <FadeUp><WhyOkelcor /></FadeUp>
      <WhoWeServeSection />

      <Suspense fallback={<BrandsSkeleton />}>
        <BrandsSection />
      </Suspense>

      <FetTeaser />

      <Logistics />
      <TyreHighlightsSection />
      <RexCertified />
      <CTASection />
      <FloatingBar />
      <Footer />
    </main>
  );
}
