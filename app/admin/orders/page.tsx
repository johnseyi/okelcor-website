import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  adminApiFetch,
  adminSafeFetch,
  AdminUnauthorizedError,
  type AdminOrder,
} from "@/lib/admin-api";
import OrdersTable from "@/components/admin/orders-table";
import OrdersCsvActions from "@/components/admin/orders-csv-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders" };

type SearchParams = Promise<{ status?: string; q?: string; page?: string }>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status, q, page } = await searchParams;

  try {
    await adminApiFetch<AdminOrder[]>("/orders", {
      params: { per_page: 1 },
      revalidate: false,
    });
  } catch (e) {
    if (e instanceof AdminUnauthorizedError) redirect("/admin/login");
  }

  const params: Record<string, string | number> = { per_page: 20 };
  if (status && status !== "all") params.status = status;
  if (q?.trim()) params.q = q.trim();
  if (page) params.page = page;

  const res = await adminSafeFetch<AdminOrder[]>("/orders", {
    params,
    revalidate: false,
  });

  const orders: AdminOrder[] = Array.isArray(res?.data) ? res.data : [];
  const meta = res?.meta ?? {};

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
            Orders
          </p>
          <p className="mt-0.5 text-[0.875rem] text-[#5c5e62]">
            {typeof meta.total === "number"
              ? `${meta.total} order${meta.total !== 1 ? "s" : ""} total`
              : "Manage customer orders"}
          </p>
        </div>
        <OrdersCsvActions />
      </div>

      <OrdersTable
        orders={orders}
        meta={meta}
        currentStatus={status ?? "all"}
        currentQ={q ?? ""}
        currentPage={Number(page ?? 1)}
      />
    </div>
  );
}
