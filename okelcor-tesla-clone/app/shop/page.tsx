import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ShopHero from "@/components/shop/shop-hero";
import ShopCatalogue from "@/components/shop/shop-catalogue";

export const metadata: Metadata = {
  title: "Shop – Okelcor",
  description:
    "Browse premium PCR, TBR, OTR, and used tyres from leading global brands. Filter by brand, season, and tyre type.",
};

export default function ShopPage() {
  return (
    <main>
      <Navbar />
      <ShopHero />
      <ShopCatalogue />
      <Footer />
    </main>
  );
}
