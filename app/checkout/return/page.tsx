"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ChevronRight } from "lucide-react";

type Status = "loading" | "paid" | "pending" | "failed";

export default function CheckoutReturnPage() {
  const searchParams = useSearchParams();
  const orderRef     = searchParams.get("orderRef") ?? "";

  const [status, setStatus] = useState<Status>("loading");
  const [amount, setAmount]  = useState<string>("");

  useEffect(() => {
    const paymentId = sessionStorage.getItem("mollie_payment_id");
    sessionStorage.removeItem("mollie_payment_id");
    sessionStorage.removeItem("mollie_order_ref");

    if (!paymentId) {
      // No paymentId stored — treat as unknown/pending
      setStatus("pending");
      return;
    }

    fetch(`/api/payments/mollie/status?paymentId=${encodeURIComponent(paymentId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "paid") {
          setStatus("paid");
          setAmount(data.amount?.value ? `€${data.amount.value}` : "");
        } else if (data.status === "open" || data.status === "pending") {
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("pending"));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 py-16">
      <div className="mx-auto w-full max-w-[480px]">

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 rounded-[22px] bg-white p-10 shadow-sm">
            <Loader2 size={40} className="animate-spin text-[#E85C1A]" />
            <p className="text-[1rem] font-semibold text-[#1a1a1a]">Verifying your payment…</p>
          </div>
        )}

        {status === "paid" && (
          <div className="rounded-[22px] bg-white p-10 text-center shadow-sm">
            <CheckCircle2 size={56} strokeWidth={1.5} className="mx-auto text-green-500" />
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#1a1a1a]">
              Payment Confirmed
            </h1>
            <p className="mt-2 text-[0.95rem] leading-7 text-[#5c5e62]">
              Thank you! Your payment was successful. We&apos;ll prepare your order for dispatch and send a confirmation to your email.
            </p>
            {orderRef && (
              <div className="mt-5 rounded-[14px] bg-[#f5f5f5] px-5 py-3">
                <p className="text-[0.78rem] text-[#5c5e62]">Order reference</p>
                <p className="mt-0.5 text-[1.1rem] font-extrabold tracking-wider text-[#1a1a1a]">
                  {orderRef}
                </p>
                {amount && (
                  <p className="mt-1 text-[0.85rem] font-semibold text-green-600">{amount} paid</p>
                )}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/shop"
                className="flex h-[46px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#E85C1A] text-[0.9rem] font-semibold text-white transition hover:bg-[#d4511a]"
              >
                Continue Shopping <ChevronRight size={15} />
              </Link>
              <Link
                href="/"
                className="flex h-[46px] flex-1 items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f5f5f5]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="rounded-[22px] bg-white p-10 text-center shadow-sm">
            <CheckCircle2 size={56} strokeWidth={1.5} className="mx-auto text-amber-500" />
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#1a1a1a]">
              Order Received
            </h1>
            <p className="mt-2 text-[0.95rem] leading-7 text-[#5c5e62]">
              Your order has been placed. If your payment is still processing, you&apos;ll receive a confirmation email once it&apos;s complete.
            </p>
            {orderRef && (
              <div className="mt-5 rounded-[14px] bg-[#f5f5f5] px-5 py-3">
                <p className="text-[0.78rem] text-[#5c5e62]">Order reference</p>
                <p className="mt-0.5 text-[1.1rem] font-extrabold tracking-wider text-[#1a1a1a]">
                  {orderRef}
                </p>
              </div>
            )}
            <div className="mt-6">
              <Link
                href="/"
                className="flex h-[46px] w-full items-center justify-center rounded-full bg-[#1a1a1a] text-[0.9rem] font-semibold text-white transition hover:bg-[#333]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="rounded-[22px] bg-white p-10 text-center shadow-sm">
            <XCircle size={56} strokeWidth={1.5} className="mx-auto text-red-500" />
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#1a1a1a]">
              Payment Not Completed
            </h1>
            <p className="mt-2 text-[0.95rem] leading-7 text-[#5c5e62]">
              Your payment was not completed. No charge has been made. Please try again or contact us if the problem persists.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/checkout"
                className="flex h-[46px] flex-1 items-center justify-center rounded-full bg-[#E85C1A] text-[0.9rem] font-semibold text-white transition hover:bg-[#d4511a]"
              >
                Try Again
              </Link>
              <Link
                href="/contact"
                className="flex h-[46px] flex-1 items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f5f5f5]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
