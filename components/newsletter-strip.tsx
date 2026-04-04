"use client";

import { useState } from "react";
import { useLanguage } from "@/context/language-context";

export default function NewsletterStrip() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      if (!API_URL) {
        throw new Error("Newsletter API URL is not configured.");
      }

      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const json = await res.json().catch(() => ({} as {
        message?: string;
        errors?: Record<string, string[]>;
      }));

      if (!res.ok) {
        const validationError = json.errors?.email?.[0];
        throw new Error(validationError || json.message || "Subscription failed. Please try again.");
      }

      setSubmitted(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full border-t border-black/[0.07] bg-[#f5f5f5]">
      <div className="tesla-shell py-10 md:py-12">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:gap-10 md:text-left">

          <div className="shrink-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--primary)]">
              {t.newsletter.eyebrow}
            </p>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-[var(--foreground)] md:text-2xl">
              {t.newsletter.title}
            </h2>
            <p className="mt-1 text-[0.88rem] text-[var(--muted)]">
              {t.newsletter.subtitle}
            </p>
          </div>

          {submitted ? (
            <div className="flex items-center gap-3 rounded-[14px] bg-green-50 px-6 py-4 text-[0.9rem] font-semibold text-green-700">
              <span className="text-green-500">✓</span>
              {t.newsletter.success}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-md flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder={t.newsletter.placeholder}
                  className="h-[48px] min-w-0 flex-1 rounded-full border border-black/[0.10] bg-white px-5 text-[0.9rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[48px] shrink-0 rounded-full bg-[var(--primary)] px-6 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
                >
                  {submitting ? "..." : t.newsletter.button}
                </button>
              </div>
              {error && (
                <p className="pl-2 text-[0.78rem] text-red-500">{error}</p>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
