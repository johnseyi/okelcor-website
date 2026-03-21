import Navbar from "@/components/navbar";
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