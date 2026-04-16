import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ShopHero from "@/components/shop/shop-hero";
import ShopCatalogue from "@/components/shop/shop-catalogue";
import FadeUp from "@/components/motion/fade-up";
import { type Product } from "@/components/shop/data";
import { getServerLocale } from "@/lib/locale";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(p: any): Product {
  const img = p.primary_image ?? p.image_url ?? p.image ?? p.images?.[0] ?? "";
  return {
    id:          p.id,
    brand:       p.brand ?? "",
    name:        p.name ?? "",
    size:        p.size ?? "",
    spec:        p.spec ?? "",
    season:      p.season ?? "",
    type:        p.type ?? "",
    price:       p.price ?? 0,
    sku:         p.sku ?? "",
    description: p.description ?? "",
    image:       img,
    images:      p.images?.length ? p.images : (img ? [img] : []),
  };
}

async function getProducts(locale: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?locale=${locale}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data.map(toProduct) : [];
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const locale = await getServerLocale();
  const products = await getProducts(locale);

  return (
    <main>
      <Navbar />
      <ShopHero />
      <FadeUp><ShopCatalogue products={products} /></FadeUp>
      <Footer />
    </main>
  );
}
