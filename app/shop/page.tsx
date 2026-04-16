import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ShopHero from "@/components/shop/shop-hero";
import ShopCatalogue from "@/components/shop/shop-catalogue";
import FadeUp from "@/components/motion/fade-up";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse premium PCR, TBR, OTR, and used tyres from leading global brands. Filter by brand, season, and tyre type.",
  openGraph: {
    title: "Shop Premium Tyres – Okelcor",
    description:
      "PCR, TBR, OTR, and used tyres from Michelin, Bridgestone, Goodyear, Continental, Pirelli, and Dunlop. Global wholesale supply.",
    url: "/shop",
    type: "website",
  },
  twitter: {
    title: "Shop Premium Tyres – Okelcor",
    description:
      "PCR, TBR, OTR, and used tyres from top global brands. Wholesale supply worldwide.",
  },
};

// Products are now fetched client-side in ShopCatalogue with the user's
// actual filter params — the API requires at least one filter to return results.
export default function ShopPage() {
  return (
    <main>
      <Navbar />
      <ShopHero />
      <FadeUp><ShopCatalogue /></FadeUp>
      <Footer />
    </main>
  );
}
