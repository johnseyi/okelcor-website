import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Truck } from "lucide-react";
import {
  adminApiFetch, adminSafeFetch, AdminUnauthorizedError, type AdminOrder,
} from "@/lib/admin-api";
import OrdersTable from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "In Transit" };

type SearchParams = Promise<{ q?: string; page?: string; channel?: string }>;

/**
 * The in-transit queue — paid and dispatched, not yet delivered.
 *
 * This is the order manager's cue that trade documents need sending, and the
 * filter is the whole value: finding these by eye means opening orders one at a
 * time to check payment against dispatch.
 *
 * Status and payment filters are deliberately not offered. `in_transit` is
 * already defined as a payment-and-dispatch state server-side, so a second
 * status filter on top of it can only produce empty lists that look like bugs.
 */
export default async function AdminInTransitPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, page, channel } = await searchParams;

  try {
    await adminApiFetch<AdminOrder[]>("/orders", { params: { per_page: 1 }, revalidate: false });
  } catch (e) {
    if (e instanceof AdminUnauthorizedError) redirect("/admin/login");
  }

  const params: Record<string, string | number> = { per_page: 20, in_transit: 1 };
  if (q?.trim())                       params.q       = q.trim();
  if (page)                            params.page    = page;
  if (channel && channel !== "all")    params.channel = channel;

  const res = await adminSafeFetch<AdminOrder[]>("/orders", { params, revalidate: false });
  const orders: AdminOrder[] = Array.isArray(res?.data) ? res.data : [];
  const meta = res?.meta ?? {};

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
          In Transit
        </p>
        <p className="mt-0.5 text-[0.875rem] text-[#5c5e62]">
          {typeof meta.total === "number"
            ? `${meta.total} order${meta.total !== 1 ? "s" : ""} paid and dispatched, not yet delivered`
            : "Paid and dispatched, not yet delivered"}
        </p>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-black/[0.07] bg-white px-4 py-2.5 text-[0.78rem] leading-snug text-[#5c5e62]">
        <Truck size={14} className="mt-0.5 shrink-0 text-[#E85C1A]" />
        <p>
          These orders are on their way and are the ones most likely to need trade documents
          sent. Open an order to see which documents it already has —{" "}
          <span className="text-[#8c8f94]">
            the orders list doesn&apos;t carry document state, so this queue can&apos;t show a
            &ldquo;documents sent&rdquo; column without asserting something it hasn&apos;t been told.
          </span>
        </p>
      </div>

      <OrdersTable
        orders={orders}
        meta={meta}
        basePath="/admin/orders/in-transit"
        currentStatus="all"
        currentPaymentStatus="all"
        currentQ={q ?? ""}
        currentPage={Number(page ?? 1)}
        emptyHeading="Nothing in transit"
        emptyDescription="Orders appear here once they are paid and dispatched, until they are marked delivered."
      />
    </div>
  );
}
