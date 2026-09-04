import Link from "next/link";
import { ArrowRight, BadgePercent, FileText, RotateCcw } from "lucide-react";

/**
 * The trade account funnel. ATD's homepage has exactly two actions that
 * matter, "ATDOnline Login" and "Become a Dealer"; Bohnenkamp leads with its
 * online shop button; Heuver gates prices behind "My Heuver". Okelcor has
 * the whole machine built (application review, invitation, the customer
 * portal with documents and reorder) and the old homepage never mentioned
 * it. This band is where a distributor becomes an account.
 */
const BENEFITS = [
  {
    Icon: BadgePercent,
    title: "Trade pricing",
    sub: "Wholesale rates on container and pallet volumes, quoted in writing.",
  },
  {
    Icon: FileText,
    title: "Your documents in one place",
    sub: "Order confirmations, proformas, invoices and shipping papers, all in your portal.",
  },
  {
    Icon: RotateCcw,
    title: "Reorder in one click",
    sub: "Saved sizes and past orders make the second purchase a two minute job.",
  },
] as const;

export default function TradeAccountBand() {
  return (
    <section aria-label="Trade accounts" className="border-y border-black/10 bg-[#f5f5f5]">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-[#171a20] sm:text-[1.7rem]">
              Buying for a business?
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-[0.95rem] leading-relaxed text-[#5c5e62]">
              Open a trade account and buy at wholesale terms. Applications are
              reviewed by a person, usually within one working day.
            </p>

            <div className="mt-7 grid gap-6 sm:grid-cols-3">
              {BENEFITS.map(({ Icon, title, sub }) => (
                <div key={title}>
                  <Icon size={20} strokeWidth={2} className="text-[#f4511e]" aria-hidden />
                  <p className="mt-2.5 text-[0.92rem] font-bold text-[#171a20]">{title}</p>
                  <p className="mt-1 text-[0.82rem] leading-snug text-[#5c5e62]">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-56">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#171a20] px-6 text-[0.92rem] font-bold text-white transition-colors hover:bg-black"
            >
              Open a trade account
              <ArrowRight size={15} strokeWidth={2.4} aria-hidden />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-md border border-black/20 px-6 text-[0.92rem] font-semibold text-[#171a20] transition-colors hover:border-black/50"
            >
              Sign in to your account
            </Link>
            <p className="text-center text-[0.75rem] text-[#8c8f94]">
              Private buyer? The shop works without an account.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
