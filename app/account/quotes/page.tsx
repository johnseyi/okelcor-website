import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getCustomerFromCookie } from "@/lib/get-customer";

export const metadata: Metadata = {
  title: "Quote Requests",
  description: "View and manage your Okelcor quote requests.",
};

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuoteStatus = "pending" | "reviewed" | "approved" | "rejected";

type QuoteRequest = {
  id: number;
  ref: string;
  created_at: string;
  status: QuoteStatus;
  product_details: string;
  quantity: number;
  notes?: string;
};

const STATUS_CONFIG: Record<QuoteStatus, { label: string; cls: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  pending:  { label: "Pending Review", cls: "bg-amber-50 text-amber-700 border-amber-200",   icon: Clock },
  reviewed: { label: "Under Review",   cls: "bg-blue-50 text-blue-700 border-blue-200",      icon: Clock },
  approved: { label: "Approved",       cls: "bg-green-50 text-green-700 border-green-200",   icon: CheckCircle2 },
  rejected: { label: "Declined",       cls: "bg-red-50 text-red-600 border-red-200",         icon: XCircle },
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchQuotes(token: string): Promise<QuoteRequest[]> {
  const API_URL =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000/api/v1";
  try {
    const res = await fetch(`${API_URL}/auth/quotes`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function QuotesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value;
  if (!token) redirect("/login?redirect=/account/quotes");

  const customer = await getCustomerFromCookie();
  if (!customer) redirect("/login?redirect=/account/quotes");

  const quotes = await fetchQuotes(token);

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      <div className="tesla-shell pb-16 pt-[96px]">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-[0.8rem] text-[var(--muted)]">
          <Link href="/account" className="hover:text-[var(--foreground)]">My Account</Link>
          <ChevronRight size={13} strokeWidth={2} />
          <span className="text-[var(--foreground)] font-medium">Quote Requests</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">B2B</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">Quote Requests</h1>
          </div>
          <Link
            href="/quote"
            className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            New Quote <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        {quotes.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-black/[0.06] bg-white py-20 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f5f5]">
              <FileText size={24} strokeWidth={1.5} className="text-[var(--muted)]" />
            </div>
            <p className="mt-4 text-[1rem] font-bold text-[var(--foreground)]">No quote requests yet</p>
            <p className="mt-1 max-w-[300px] text-[0.85rem] leading-6 text-[var(--muted)]">
              Submit a quote request for bulk pricing on tyres and our team will respond within 24 hours.
            </p>
            <Link
              href="/quote"
              className="mt-6 flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-[0.88rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              Request a Quote <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        ) : (
          /* Quote list */
          <div className="flex flex-col gap-3">
            {quotes.map((q) => {
              const s = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.pending;
              const Icon = s.icon;
              return (
                <div
                  key={q.id}
                  className="rounded-[18px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.78rem] font-semibold uppercase tracking-widest text-[var(--muted)]">
                        {q.ref}
                      </p>
                      <p className="mt-1 font-semibold text-[var(--foreground)]">{q.product_details}</p>
                      <p className="mt-0.5 text-[0.83rem] text-[var(--muted)]">
                        Qty: {q.quantity} · {new Date(q.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {q.notes && <p className="mt-1 text-[0.82rem] text-[var(--muted)] italic">{q.notes}</p>}
                    </div>
                    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.75rem] font-semibold ${s.cls}`}>
                      <Icon size={12} />
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
