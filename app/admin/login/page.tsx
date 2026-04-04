"use client";

import { useState, useTransition } from "react";
import { loginAdmin } from "@/app/admin/actions";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await loginAdmin(email, password);
      // If loginAdmin succeeds it calls redirect() and never returns here.
      // We only reach this line when it returns { error }.
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] p-4">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E85C1A]">
            <span className="text-xl font-extrabold tracking-tight text-white">OK</span>
          </div>
          <div>
            <p className="text-[1.4rem] font-extrabold text-white">Okelcor Admin</p>
            <p className="mt-0.5 text-[0.83rem] text-white/40">
              Sign in to manage your content
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-black/40">

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                />
              </svg>
              <p className="text-[0.83rem] text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-[0.82rem] font-semibold text-[#1a1a1a]"
              >
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@okelcor.com"
                className="w-full rounded-xl border border-black/[0.10] bg-[#f5f5f5] px-4 py-3 text-[0.93rem] text-[#1a1a1a] outline-none placeholder:text-[#aaa] transition focus:border-[#E85C1A] focus:bg-white focus:ring-2 focus:ring-[#E85C1A]/15"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-[0.82rem] font-semibold text-[#1a1a1a]"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-black/[0.10] bg-[#f5f5f5] px-4 py-3 text-[0.93rem] text-[#1a1a1a] outline-none placeholder:text-[#aaa] transition focus:border-[#E85C1A] focus:bg-white focus:ring-2 focus:ring-[#E85C1A]/15"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-1 flex h-[52px] w-full items-center justify-center rounded-full bg-[#E85C1A] text-[0.95rem] font-semibold text-white transition hover:bg-[#d14f14] disabled:opacity-60"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>

          </form>
        </div>

        <p className="mt-6 text-center text-[0.75rem] text-white/25">
          Okelcor GmbH · Admin Panel
        </p>
      </div>
    </div>
  );
}
