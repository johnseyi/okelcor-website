import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  adminApiFetch,
  adminSafeFetch,
  AdminUnauthorizedError,
  type AdminProduct,
} from "@/lib/admin-api";
import ProductsTable from "@/components/admin/products-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

type SearchParams = Promise<{ q?: string; type?: string; page?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, type, page } = await searchParams;

  // Auth check — token exists (middleware), but may be expired
  try {
    await adminApiFetch<AdminProduct[]>("/products", {
      params: { per_page: 1 },
      revalidate: false,
    });
  } catch (e) {
    if (e instanceof AdminUnauthorizedError) redirect("/admin/login");
    // Other errors (network down) — fall through, table shows empty
  }

  const params: Record<string, string | number> = { per_page: 20 };
  if (q?.trim())           params.q    = q.trim();
  if (type && type !== "all") params.type = type;
  if (page)                params.page = page;

  const res = await adminSafeFetch<AdminProduct[]>("/products", {
    params,
    revalidate: false,
  });

  const products: AdminProduct[] = Array.isArray(res?.data) ? res.data : [];
  const meta = res?.meta ?? {};

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
            Catalogue
          </p>
          <p className="mt-0.5 text-[0.875rem] text-[#5c5e62]">
            {typeof meta.total === "number"
              ? `${meta.total} product${meta.total !== 1 ? "s" : ""} total`
              : "Manage your product catalogue"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin/products/trash"
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-[0.875rem] font-semibold text-[#5c5e62] transition hover:border-red-200 hover:text-red-600"
          >
            <Trash2 size={15} strokeWidth={2} />
            Trash
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-full bg-[#E85C1A] px-5 py-2.5 text-[0.875rem] font-semibold text-white transition hover:bg-[#d14f14]"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Product
          </Link>
        </div>
      </div>

      <ProductsTable
        products={products}
        meta={meta}
        currentQ={q ?? ""}
        currentType={type ?? "all"}
        currentPage={Number(page ?? 1)}
      />
    </div>
  );
}
