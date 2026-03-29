"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f5f5f5] px-6 text-center">
      <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
        Something went wrong
      </p>

      <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-5xl">
        An unexpected error occurred.
      </h1>

      <p className="mt-5 max-w-md text-[1.05rem] leading-7 text-[var(--muted)]">
        We&apos;re sorry for the inconvenience. You can try again or return to
        the homepage.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-[46px] items-center justify-center rounded-full bg-[var(--primary)] px-8 text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex h-[46px] items-center justify-center rounded-full border border-black/10 bg-white px-8 text-[0.95rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
