import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata = {
  title: "Checkout Cancelled - Okelcor",
  description: "Your checkout was cancelled. No payment has been taken.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 py-16">
      <div className="mx-auto w-full max-w-[480px] rounded-[22px] bg-white p-10 text-center shadow-sm">
        <XCircle size={56} strokeWidth={1.5} className="mx-auto text-amber-500" />
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#1a1a1a]">
          Checkout Cancelled
        </h1>
        <p className="mt-2 text-[0.95rem] leading-7 text-[#5c5e62]">
          Your payment was not completed and no charge has been made. You can return to checkout whenever you are ready.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/checkout"
            className="flex h-[46px] flex-1 items-center justify-center rounded-full bg-[#E85C1A] text-[0.9rem] font-semibold text-white transition hover:bg-[#d4511a]"
          >
            Return to Checkout
          </Link>
          <Link
            href="/shop"
            className="flex h-[46px] flex-1 items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f5f5f5]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
