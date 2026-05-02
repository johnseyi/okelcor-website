"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ChevronRight, MailCheck } from "lucide-react";

export default function CheckoutReturnPage() {
  const searchParams  = useSearchParams();
  const sessionId     = searchParams.get("session_id") ?? "";
  const queryOrderRef = searchParams.get("order_ref") ?? searchParams.get("orderRef") ?? "";

  const [orderRef] = useState(() =>
    queryOrderRef ||
    (typeof window !== "undefined" ? sessionStorage.getItem("stripe_order_ref") ?? "" : "")
  );

  useEffect(() => {
    sessionStorage.removeItem("stripe_checkout_session_id");
    sessionStorage.removeItem("stripe_order_ref");
  }, []);

  // Stripe Checkout success — session_id is always present in the success_url redirect.
  if (sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 py-16">
        <div className="mx-auto w-full max-w-[480px]">
          <div className="rounded-[22px] bg-white p-10 text-center shadow-sm">
            <CheckCircle2 size={56} strokeWidth={1.5} className="mx-auto text-green-500" />
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
              Order received
            </h1>
            <p className="mt-2 text-[0.95rem] leading-7 text-[var(--muted)]">
              Your payment was submitted successfully. We&apos;ll email your confirmation once
              Stripe confirms the payment.
            </p>

            {orderRef && (
              <div className="mt-5 rounded-[14px] bg-[#f5f5f5] px-5 py-3">
                <p className="text-[0.78rem] text-[var(--muted)]">Order reference</p>
                <p className="mt-0.5 text-[1.05rem] font-extrabold tracking-wider text-[var(--foreground)]">
                  {orderRef}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/shop"
                className="flex h-[46px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
              >
                Continue Shopping <ChevronRight size={15} />
              </Link>
              <Link
                href="/"
                className="flex h-[46px] flex-1 items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f5f5f5]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No session_id — direct navigation or stale link. Stripe always includes
  // session_id in the success_url, so this state should not occur in practice.
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 py-16">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="rounded-[22px] bg-white p-10 text-center shadow-sm">
          <MailCheck size={56} strokeWidth={1.5} className="mx-auto text-[var(--muted)]" />
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
            Check your email
          </h1>
          <p className="mt-2 text-[0.95rem] leading-7 text-[var(--muted)]">
            If you&apos;ve just completed a payment, you&apos;ll receive a confirmation email
            shortly. Contact us if you need help.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/"
              className="flex h-[46px] flex-1 items-center justify-center rounded-full bg-[var(--foreground)] text-[0.9rem] font-semibold text-white transition hover:opacity-80"
            >
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="flex h-[46px] flex-1 items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f5f5f5]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
