import type { Metadata } from "next";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Okelcor – Growing Together",
  description:
    "Munich-based global tyre supplier. Premium PCR, TBR, and used tyres for distributors and wholesalers in over 30 countries.",
  openGraph: {
    title: "Okelcor – Growing Together",
    description:
      "Munich-based global tyre supplier. Premium PCR, TBR, and used tyres for distributors and wholesalers in over 30 countries.",
    url: "/",
    type: "website",
  },
  twitter: {
    title: "Okelcor – Growing Together",
    description:
      "Munich-based global tyre supplier. PCR, TBR, and used tyres for distributors worldwide.",
  },
};
import Hero from "@/components/hero";
import Categories from "@/components/categories";
import WhyOkelcor from "@/components/why-okelcor";
import Brands from "@/components/brands";
import Logistics from "@/components/logistics";
import UsedTyresSection from "@/components/used-tyres-section";
import TbrFeatureSection from "@/components/tbr-feature-section";
import RexCertified from "@/components/rex-certified";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";
import FloatingBar from "@/components/floating-bar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Categories />
      <WhyOkelcor />
      <Brands />
      <Logistics />
      <UsedTyresSection />
      <TbrFeatureSection />
      <RexCertified />
      <CTASection />
      <FloatingBar />
      <Footer />
    </main>
  );
}