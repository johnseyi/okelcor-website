import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import CompanyStory from "@/components/about/company-story";
import Services from "@/components/about/services";
import LogisticsPartners from "@/components/about/logistics-partners";
import CTASection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "About – Okelcor",
  description:
    "Okelcor is a Munich-based global tyre supplier delivering PCR, TBR, and used tyres to wholesalers and distributors worldwide.",
};

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      <PageHero
        eyebrow="About Okelcor"
        title="Your trusted global tyre supply partner."
        subtitle="Headquartered in Munich. Supplying premium PCR, TBR, LT, and used tyres to wholesalers and distributors in over 30 countries."
        image="https://i.pinimg.com/736x/5b/e4/16/5be4168ce486d6b055931bbb60fb5a05.jpg"
      />

      <CompanyStory />
      <Services />
      <LogisticsPartners />
      <CTASection />
      <Footer />
    </main>
  );
}
