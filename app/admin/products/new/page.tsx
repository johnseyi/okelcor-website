import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductForm from "@/components/admin/product-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add Product" };

export default function NewProductPage() {
  return (
    <div className="p-6 md:p-8">
      {/* Back + header */}
      <div className="mb-7">
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-[#5c5e62] transition hover:text-[#E85C1A]"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Back to Products
        </Link>
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
          New Product
        </p>
        <p className="mt-0.5 text-[0.875rem] text-[#5c5e62]">
          Fill in the details below. Gallery images can be uploaded now or added later from the edit page.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
