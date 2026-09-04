"use client";

import { useEffect, useState } from "react";
import { Crisp } from "crisp-sdk-web";
import { usePathname } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $crisp: any[];
  }
}

/**
 * Live chat behind our own launcher.
 *
 * Crisp's default bubble is a ~60px teaser that sat over the footer's legal
 * links — visitors could not click Imprint. Its own launcher is now hidden
 * entirely (hide:on:load, and chat:hide again on close) and this component
 * renders a small button in the site's own language instead. Clicking it
 * shows and opens the full Crisp panel; closing the panel shrinks back to
 * the button. A dot appears when a message arrives while it is closed.
 *
 * Nothing about the chat itself changed: same Crisp site, same identity
 * wiring, same conversations.
 */
export default function CrispChat() {
  const pathname = usePathname();
  const { customer } = useCustomerAuth();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (!process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID) return;

    Crisp.configure(process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID, {
      autoload: true,
    });

    if (typeof window !== "undefined") {
      window.$crisp = window.$crisp || [];
      window.$crisp.push(["safe", true]);
      // Never show Crisp's own launcher — ours is the only entry point.
      // The DO command queues and applies whenever Crisp finishes loading;
      // the hide:on:load config flag raced the loader and lost, which is
      // how the site briefly showed TWO chat buttons.
      window.$crisp.push(["do", "chat:hide"]);

      window.$crisp.push(["on", "chat:opened", () => { setOpen(true); setUnread(false); }]);
      window.$crisp.push(["on", "chat:closed", () => {
        setOpen(false);
        // Back to the small state: hide the whole panel again.
        window.$crisp.push(["do", "chat:hide"]);
      }]);
      window.$crisp.push(["on", "message:received", () => setUnread(true)]);
    }

    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (!process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID) return;
    if (!customer) return;

    try {
      Crisp.user.setEmail(customer.email);
      Crisp.user.setNickname(`${customer.first_name} ${customer.last_name}`);
      if (customer.company_name) {
        Crisp.user.setCompany(customer.company_name, {});
      }
    } catch {
      // Crisp not yet ready — silently skip
    }
  }, [customer, pathname]);

  if (pathname?.startsWith("/admin")) return null;
  if (!ready || open) return null;

  return (
    <button
      type="button"
      aria-label="Talk to us"
      onClick={() => {
        try {
          window.$crisp.push(["do", "chat:show"]);
          window.$crisp.push(["do", "chat:open"]);
        } catch { /* crisp unavailable */ }
      }}
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4511e]"
    >
      {/* The label rolls out on hover, like a chalk board being turned round */}
      <span className="pointer-events-none max-w-0 overflow-hidden whitespace-nowrap rounded-l-full bg-[#171a20] text-[0.8rem] font-semibold text-white opacity-0 transition-all duration-300 group-hover:mr-[-22px] group-hover:max-w-[130px] group-hover:py-2.5 group-hover:pl-4 group-hover:pr-7 group-hover:opacity-100">
        Talk to us
      </span>

      {/* A tyre, not a bubble: tread ring, sidewall, orange hub. It rolls a
          quarter turn on hover. Nobody else's chat button is a tyre. */}
      <span className="relative block h-12 w-12 transition-transform duration-300 group-hover:rotate-90">
        <svg viewBox="0 0 48 48" className="h-12 w-12 drop-shadow-md" aria-hidden>
          {/* tread blocks */}
          <g fill="#171a20">
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              const x = 24 + 21 * Math.cos(a);
              const y = 24 + 21 * Math.sin(a);
              return <circle key={i} cx={x} cy={y} r={3.4} />;
            })}
          </g>
          {/* tyre body */}
          <circle cx="24" cy="24" r="21" fill="#171a20" />
          {/* sidewall groove */}
          <circle cx="24" cy="24" r="15.5" fill="none" stroke="#3a3e46" strokeWidth="1.5" />
          {/* rim */}
          <circle cx="24" cy="24" r="10.5" fill="#f5f5f5" />
          {/* hub */}
          <circle cx="24" cy="24" r="4.2" fill="#f4511e" />
          {/* wheel bolts */}
          <g fill="#c9ccd1">
            {Array.from({ length: 5 }).map((_, i) => {
              const a = ((i * 72 - 90) * Math.PI) / 180;
              const x = 24 + 7.4 * Math.cos(a);
              const y = 24 + 7.4 * Math.sin(a);
              return <circle key={i} cx={x} cy={y} r={1.3} />;
            })}
          </g>
        </svg>
        {unread && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#f4511e]" aria-hidden />
        )}
      </span>
    </button>
  );
}
