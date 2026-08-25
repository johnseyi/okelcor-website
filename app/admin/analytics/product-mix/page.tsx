import type { Metadata } from "next";
import ProductMixBoard from "@/components/admin/product-mix-board";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Promotion Insight — Admin" };

export default function ProductMixPage() {
  return <ProductMixBoard />;
}
