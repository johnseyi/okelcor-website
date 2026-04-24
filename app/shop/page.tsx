import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ShopPromoBanner, { type ShopPromotion } from "@/components/shop/shop-promo-banner";
import ShopPageClient from "@/components/shop/shop-page-client";
import FadeUp from "@/components/motion/fade-up";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Buy Tyres Online – PCR, TBR & Used Tyres",
  description:
    "Browse premium PCR, TBR, OTR, and used tyres from leading global brands. Filter by brand, season, and tyre type.",
  openGraph: {
    title: "Buy Tyres Online – PCR, TBR & Used Tyres | Okelcor Tires",
    description:
      "PCR, TBR, OTR, and used tyres from Michelin, Bridgestone, Goodyear, Continental, Pirelli, and Dunlop. Global wholesale supply.",
    url: "https://www.okelcor.com/shop",
    type: "website",
  },
  twitter: {
    title: "Buy Tyres Online – PCR, TBR & Used Tyres | Okelcor Tires",
    description:
      "PCR, TBR, OTR, and used tyres from top global brands. Wholesale supply worldwide.",
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function getActivePromotion(): Promise<ShopPromotion | null> {
  try {
    const res = await fetch(`${API_URL}/promotions/active`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SUPPORTED_PARAMS = ["q", "type", "brand", "size", "season", "speed", "load_index", "price_min", "price_max"];

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const [activePromo, params] = await Promise.all([getActivePromotion(), searchParams]);

  const initialFilters: Record<string, string> = {};
  for (const key of SUPPORTED_PARAMS) {
    const val = params[key];
    if (typeof val === "string" && val.trim()) initialFilters[key] = val.trim();
  }

  return (
    <main>
      <Navbar />
      <ShopPromoBanner promo={activePromo} />
      <FadeUp>
        <ShopPageClient
          initialFilters={Object.keys(initialFilters).length > 0 ? initialFilters : undefined}
        />
      </FadeUp>
      <Footer />
    </main>
  );
}
