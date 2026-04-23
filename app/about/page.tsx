import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AboutPageUI from "@/components/about/about-page-ui";
import CTASection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "About Us – Munich-Based Global Tyre Supplier",
  description:
    "Okelcor is a Munich-based global tyre supplier delivering PCR, TBR, and used tyres to wholesalers and distributors worldwide.",
  openGraph: {
    title: "About Us – Munich-Based Global Tyre Supplier | Okelcor Tires",
    description:
      "Headquartered in Munich, Okelcor supplies premium PCR, TBR, and used tyres to distributors in over 30 countries.",
    url: "https://www.okelcor.com/about",
    type: "website",
  },
  twitter: {
    title: "About Okelcor – Global Tyre Supply Partner",
    description:
      "Headquartered in Munich. Premium PCR, TBR, and used tyres for distributors in over 30 countries.",
  },
};

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <AboutPageUI />
      <CTASection />
      <Footer />
    </main>
  );
}
