"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, PackageSearch } from "lucide-react";
import { COMPANY_PHONE, COMPANY_EMAIL } from "@/lib/constants";

/**
 * The utility bar every serious tyre trader runs above the nav — phone,
 * e-mail, order tracking. Heuver, Oponeo and Blackcircles all lead with the
 * practical contact points, because a wholesale buyer with a container on
 * the water wants the phone number, not a slogan.
 *
 * The fixed navbar reads `--bar-h` for its offset (the announcement bar's
 * existing contract), so this bar announces its own height the same way —
 * 36px from md up, 0 below, kept in step with a media-query listener rather
 * than assumed.
 *
 * Real details only, from lib/constants.ts. No opening hours are shown
 * because none are recorded anywhere in this codebase — an invented
 * "Mon–Fri 8–17" that nobody answers does more damage than no hours at all.
 */
export default function TradeTopBar() {
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () =>
      document.documentElement.style.setProperty("--bar-h", mq.matches ? "36px" : "0px");

    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.documentElement.style.setProperty("--bar-h", "0px");
    };
  }, []);

  const tel = COMPANY_PHONE.replace(/[^+\d]/g, "");

  return (
    <div className="fixed inset-x-0 top-0 z-50 hidden h-9 border-b border-white/10 bg-[#0f1115] md:block">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 text-[0.78rem] text-white/70 lg:px-8">
        <div className="flex items-center gap-6">
          <a href={`tel:${tel}`} className="flex items-center gap-1.5 transition-colors hover:text-white">
            <Phone size={12} strokeWidth={2} aria-hidden />
            {COMPANY_PHONE}
          </a>
          <a href={`mailto:${COMPANY_EMAIL}`} className="hidden items-center gap-1.5 transition-colors hover:text-white lg:flex">
            <Mail size={12} strokeWidth={2} aria-hidden />
            {COMPANY_EMAIL}
          </a>
          <span className="hidden text-white/40 xl:inline">Munich, Germany &middot; Shipping EU &amp; worldwide</span>
        </div>
        <div className="flex items-center gap-6">
          {/* Tracking lives in the customer portal — there is no /tracking page. */}
          <Link href="/account" className="flex items-center gap-1.5 transition-colors hover:text-white">
            <PackageSearch size={12} strokeWidth={2} aria-hidden />
            Track your order
          </Link>
          <Link href="/quote" className="font-semibold text-white/90 transition-colors hover:text-white">
            Request a quote
          </Link>
        </div>
      </div>
    </div>
  );
}
