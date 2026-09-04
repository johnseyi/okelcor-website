"use client";

import { useEffect, useState } from "react";
import { Crisp } from "crisp-sdk-web";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
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
      // Never show Crisp's own launcher — ours is the only entry point.
      window.$crisp.push(["config", "hide:on:load", [true]]);
      window.$crisp.push(["safe", true]);

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
      aria-label="Chat with us"
      title="Chat with us"
      onClick={() => {
        try {
          window.$crisp.push(["do", "chat:show"]);
          window.$crisp.push(["do", "chat:open"]);
        } catch { /* crisp unavailable */ }
      }}
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#171a20] text-white shadow-md transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4511e]"
    >
      <MessageCircle size={19} strokeWidth={2} aria-hidden />
      {unread && (
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#f4511e]" aria-hidden />
      )}
    </button>
  );
}
