import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ShopHero from "@/components/shop/shop-hero";
import ShopCatalogue from "@/components/shop/shop-catalogue";
import FadeUp from "@/components/motion/fade-up";
import { apiFetch, type ApiProduct } from "@/lib/api";
import { type Product } from "@/components/shop/data";
import { getServerLocale } from "@/lib/locale";

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

/** Map the API product shape to the local Product shape used by all components. */
function toProduct(p: ApiProduct): Product {
  const img = p.primary_image ?? p.image_url ?? p.image ?? p.images?.[0] ?? "";
  return {
    ...p,
    image: img,
    images: p.images?.length ? p.images : (img ? [img] : []),
  };
}

async function getProducts(locale: string): Promise<Product[] | undefined> {
  try {
    const res = await apiFetch<ApiProduct[]>("/products", {
      locale,
      revalidate: 60,
      tags: ["products", `products-${locale}`],
    });
    return res.data?.length ? res.data.map(toProduct) : undefined;
  } catch {
    return undefined;
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
