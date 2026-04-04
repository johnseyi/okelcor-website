import { redirect } from "next/navigation";
import {
  Package,
  ShoppingCart,
  ClipboardList,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  adminSafeFetch,
  AdminUnauthorizedError,
  adminApiFetch,
  type AdminOrder,
  type AdminQuote,
  type AdminProduct,
  type AdminArticle,
} from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract total count: prefer meta.total, fall back to data array length. */
function getCount(res: { meta?: { total?: number }; data?: unknown[] } | null): number | null {
  if (!res) return null;
  if (typeof res.meta?.total === "number") return res.meta.total;
  if (Array.isArray(res.data)) return res.data.length;
  return null;
}

/** Format a date string to a short readable form. */
function shortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon size={20} strokeWidth={1.8} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#5c5e62]">
          {label}
        </p>
        <p className="mt-1 text-2xl font-extrabold text-[#1a1a1a]">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped:   "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    new:       "bg-orange-100 text-orange-700",
    reviewed:  "bg-blue-100 text-blue-700",
    quoted:    "bg-green-100 text-green-700",
    closed:    "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={99} className="px-5 py-8 text-center text-[0.875rem] text-[#5c5e62]">
        {message}
      </td>
    </tr>
  );
}

function ApiWarning() {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertCircle size={16} className="shrink-0 text-amber-600" />
      <p className="text-[0.83rem] text-amber-700">
        Some data could not be loaded. The API may be offline or unreachable.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  // Parallel fetches — adminSafeFetch never throws; returns null on any error.
  // We detect auth failures by trying a "test" fetch first with adminApiFetch,
  // so a missing/invalid token redirects before we waste 6 parallel calls.
  try {
    // Quick auth check — if this throws AdminUnauthorizedError we redirect.
    await adminApiFetch<AdminProduct[]>("/products", {
      params: { per_page: 1 },
      revalidate: false,
    });
  } catch (e) {
    if (e instanceof AdminUnauthorizedError) redirect("/admin/login");
    // Any other error (network down): fall through and render with null data.
  }

  const [productsRes, ordersRes, quotesRes, articlesRes, recentOrdersRes, recentQuotesRes] =
    await Promise.all([
      adminSafeFetch<AdminProduct[]>("/products",       { params: { per_page: 1, is_active: 1  }, revalidate: false }),
      adminSafeFetch<AdminOrder[]>  ("/orders",         { params: { per_page: 1  }, revalidate: false }),
      adminSafeFetch<AdminQuote[]>  ("/quote-requests", { params: { per_page: 1  }, revalidate: false }),
      adminSafeFetch<AdminArticle[]>("/articles",       { params: { per_page: 1  }, revalidate: false }),
      adminSafeFetch<AdminOrder[]>  ("/orders",         { params: { per_page: 5, sort: "latest" }, revalidate: false }),
      adminSafeFetch<AdminQuote[]>  ("/quote-requests", { params: { per_page: 5, sort: "latest" }, revalidate: false }),
    ]);

  const anyFailed = [productsRes, ordersRes, quotesRes, articlesRes].some((r) => r === null);

  const productCount  = getCount(productsRes);
  const orderCount    = getCount(ordersRes);
  const quoteCount    = getCount(quotesRes);
  const articleCount  = getCount(articlesRes);

  const recentOrders: AdminOrder[] = Array.isArray(recentOrdersRes?.data)
    ? (recentOrdersRes.data as AdminOrder[])
    : [];

  const recentQuotes: AdminQuote[] = Array.isArray(recentQuotesRes?.data)
    ? (recentQuotesRes.data as AdminQuote[])
    : [];

  return (
    <div className="p-6 md:p-8">

      {/* Page header */}
      <div className="mb-7">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
          Overview
        </p>
        <p className="mt-1 text-[0.875rem] text-[#5c5e62]">
          Here's a snapshot of your platform.
        </p>
      </div>

      {/* API warning */}
      {anyFailed && <ApiWarning />}

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Products"
          value={productCount ?? "—"}
          icon={Package}
          accent="bg-[#E85C1A]"
        />
        <StatCard
          label="Total Orders"
          value={orderCount ?? "—"}
          icon={ShoppingCart}
          accent="bg-blue-500"
        />
        <StatCard
          label="Pending Quotes"
          value={quoteCount ?? "—"}
          icon={ClipboardList}
          accent="bg-amber-500"
        />
        <StatCard
          label="Total Articles"
          value={articleCount ?? "—"}
          icon={FileText}
          accent="bg-emerald-500"
        />
      </div>

      {/* Recent tables */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent orders */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
            <p className="text-[0.9rem] font-extrabold text-[#1a1a1a]">
              Recent Orders
            </p>
            <TrendingUp size={15} className="text-[#5c5e62]" />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#fafafa]">
                <th className="px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#5c5e62]">
                  Ref
                </th>
                <th className="px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#5c5e62]">
                  Customer
                </th>
                <th className="px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#5c5e62]">
                  Status
                </th>
                <th className="px-5 py-2.5 text-right text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#5c5e62]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {recentOrders.length === 0 ? (
                <EmptyRow message="No orders yet." />
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fafafa]">
                    <td className="px-5 py-3 text-[0.82rem] font-semibold text-[#1a1a1a]">
                      {order.order_ref}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[0.82rem] text-[#1a1a1a]">{order.customer_name}</p>
                      <p className="text-[0.73rem] text-[#5c5e62]">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-right text-[0.82rem] font-semibold text-[#1a1a1a]">
                      €{Number(order.total).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent quotes */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
            <p className="text-[0.9rem] font-extrabold text-[#1a1a1a]">
              Recent Quote Requests
            </p>
            <ClipboardList size={15} className="text-[#5c5e62]" />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#fafafa]">
                <th className="px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#5c5e62]">
                  Ref
                </th>
                <th className="px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#5c5e62]">
                  Requester
                </th>
                <th className="px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#5c5e62]">
                  Category
                </th>
                <th className="px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#5c5e62]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {recentQuotes.length === 0 ? (
                <EmptyRow message="No quote requests yet." />
              ) : (
                recentQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-[#fafafa]">
                    <td className="px-5 py-3 text-[0.82rem] font-semibold text-[#1a1a1a]">
                      {quote.ref_number}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[0.82rem] text-[#1a1a1a]">{quote.full_name}</p>
                      <p className="text-[0.73rem] text-[#5c5e62]">{quote.country}</p>
                    </td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#5c5e62]">
                      {quote.tyre_category}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={quote.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
