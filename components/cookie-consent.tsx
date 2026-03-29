"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) {
      // Small delay so it doesn't flash during hydration
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    setConsent("accepted");
    setVisible(false);
  };

  const reject = () => {
    setConsent("rejected");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-black/[0.07] bg-white/96 px-5 py-4 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl md:px-10"
    >
      <div className="tesla-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-[0.86rem] leading-6 text-[var(--muted)]">
          We use cookies to improve your experience. Strictly necessary cookies
          are always active.{" "}
          <Link
            href="/privacy"
            className="text-[var(--foreground)] underline underline-offset-2 transition hover:text-[var(--primary)]"
          >
            Privacy Policy
          </Link>
        </p>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={reject}
            className="inline-flex h-[40px] items-center justify-center rounded-full border border-black/10 bg-transparent px-6 text-[0.85rem] font-semibold text-[var(--foreground)] transition hover:bg-black/[0.05]"
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            onClick={accept}
            className="inline-flex h-[40px] items-center justify-center rounded-full bg-[var(--primary)] px-6 text-[0.85rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
