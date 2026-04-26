"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] p-6 font-sans">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
            Unexpected Error
          </p>
          <h1 className="mt-2 text-xl font-extrabold text-[#1a1a1a]">
            Something went wrong
          </h1>
          <p className="mt-2 text-[0.875rem] text-[#5c5e62]">
            This error has been reported automatically. Try refreshing the page.
          </p>
          {error.digest && (
            <p className="mt-1 font-mono text-[0.72rem] text-[#aaa]">
              ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-xl bg-[#E85C1A] px-5 py-2.5 text-[0.875rem] font-semibold text-white transition hover:bg-[#d04d15]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
