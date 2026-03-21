"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, Check } from "lucide-react";
import Navbar from "@/components/navbar";

// ─── Input styles (matches quote-form pattern) ─────────────────────────────

const inputCls =
  "w-full rounded-[12px] border border-black/[0.08] bg-white px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10";

const inputErrCls =
  "w-full rounded-[12px] border border-red-400 bg-red-50/50 px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-red-500";

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab = "signin" | "signup";

type SignInData = { email: string; password: string };
type SignInErrors = Partial<SignInData>;

type SignUpData = {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
};
type SignUpErrors = Partial<SignUpData>;

// ─── Trust points shown on left panel ──────────────────────────────────────

const TRUST_POINTS = [
  "Access wholesale pricing and bulk stock",
  "Request and track tyre supply quotes",
  "Manage orders and delivery coordination",
];

// ─── Password field with visibility toggle ─────────────────────────────────

function PasswordInput({
  placeholder,
  value,
  onChange,
  error,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${error ? inputErrCls : inputCls} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p className="mt-1 text-[0.75rem] text-red-500">{error}</p>}
    </div>
  );
}

// ─── Field wrapper ──────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[0.75rem] text-red-500">{error}</p>}
    </div>
  );
}

// ─── Sign In Form ──────────────────────────────────────────────────────────

function SignInForm() {
  const [form, setForm] = useState<SignInData>({ email: "", password: "" });
  const [errors, setErrors] = useState<SignInErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof SignInData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const validate = (): SignInErrors => {
    const errs: SignInErrors = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={28} strokeWidth={1.5} className="text-green-500" />
        </div>
        <h3 className="mt-5 text-xl font-extrabold text-[var(--foreground)]">
          Welcome back
        </h3>
        <p className="mt-2 text-[0.88rem] text-[var(--muted)]">
          You're signed in. Backend integration coming soon.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-[50px] w-full items-center justify-center rounded-full bg-[var(--primary)] text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          Browse Catalogue
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field label="Email Address" error={errors.email}>
        <input
          type="email"
          placeholder="john@company.com"
          value={form.email}
          onChange={set("email")}
          className={errors.email ? inputErrCls : inputCls}
        />
      </Field>

      <Field label="Password" error={undefined}>
        <PasswordInput
          placeholder="Your password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
        />
      </Field>

      <div className="flex justify-end">
        <button
          type="button"
          className="text-[0.8rem] font-medium text-[var(--muted)] transition hover:text-[var(--primary)]"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex h-[50px] w-full items-center justify-center rounded-full bg-[var(--primary)] text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
      >
        {submitting ? (
          <span className="flex items-center gap-2.5">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Signing in…
          </span>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}

// ─── Sign Up Form ──────────────────────────────────────────────────────────

function SignUpForm() {
  const [form, setForm] = useState<SignUpData>({
    fullName: "", companyName: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof SignUpData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const validate = (): SignUpErrors => {
    const errs: SignUpErrors = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={28} strokeWidth={1.5} className="text-green-500" />
        </div>
        <h3 className="mt-5 text-xl font-extrabold text-[var(--foreground)]">
          Account created
        </h3>
        <p className="mt-2 text-[0.88rem] leading-6 text-[var(--muted)]">
          Welcome to Okelcor. Backend integration coming soon — your account will be activated when we go live.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-[50px] w-full items-center justify-center rounded-full bg-[var(--primary)] text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          Browse Catalogue
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field label="Full Name" error={errors.fullName}>
        <input
          type="text"
          placeholder="John Smith"
          value={form.fullName}
          onChange={set("fullName")}
          className={errors.fullName ? inputErrCls : inputCls}
        />
      </Field>

      <Field label="Company Name" error={errors.companyName}>
        <input
          type="text"
          placeholder="Acme Tyres GmbH (optional)"
          value={form.companyName}
          onChange={set("companyName")}
          className={inputCls}
        />
      </Field>

      <Field label="Email Address" error={errors.email}>
        <input
          type="email"
          placeholder="john@company.com"
          value={form.email}
          onChange={set("email")}
          className={errors.email ? inputErrCls : inputCls}
        />
      </Field>

      <Field label="Password" error={undefined}>
        <PasswordInput
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
        />
      </Field>

      <Field label="Confirm Password" error={undefined}>
        <PasswordInput
          placeholder="Repeat your password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
        />
      </Field>

      <p className="text-[0.78rem] leading-5 text-[var(--muted)]">
        By creating an account you agree to our{" "}
        <span className="font-medium text-[var(--foreground)]">Terms & Conditions</span>{" "}
        and{" "}
        <span className="font-medium text-[var(--foreground)]">Privacy Policy</span>.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="flex h-[50px] w-full items-center justify-center rounded-full bg-[var(--primary)] text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
      >
        {submitting ? (
          <span className="flex items-center gap-2.5">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Creating account…
          </span>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("signin");

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      <div className="flex min-h-screen pt-[76px] lg:pt-20">

        {/* ── Left panel — image + brand message ── */}
        <div className="relative hidden flex-1 lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1519638399535-1b036603ac77?auto=format&fit=crop&w=1800&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
            {/* Brand */}
            <div>
              <img
                src="/logo/okelcor-logo.png"
                alt="Okelcor"
                style={{ height: "26px", width: "auto", filter: "brightness(0) invert(1)" }}
                className="block object-contain"
              />
              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-white/60">
                Growing Together
              </p>
            </div>

            {/* Message */}
            <div className="max-w-[440px]">
              <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-5xl">
                Your global tyre supply partner.
              </h2>
              <p className="mt-4 text-[1rem] leading-7 text-white/75">
                Access wholesale pricing, manage your orders, and stay connected with Okelcor's global supply network.
              </p>

              <ul className="mt-8 flex flex-col gap-3.5">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/20">
                      <Check size={13} strokeWidth={2.5} className="text-[var(--primary)]" />
                    </div>
                    <span className="text-[0.9rem] text-white/85">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom note */}
            <p className="text-[0.78rem] text-white/40">
              © 2026 Okelcor GmbH · Munich, Germany
            </p>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex w-full flex-col items-center justify-center px-5 py-12 lg:w-[520px] lg:shrink-0 xl:w-[580px]">
          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <img
                src="/logo/okelcor-logo.png"
                alt="Okelcor"
                style={{ height: "24px", width: "auto" }}
                className="block object-contain"
              />
              <p className="mt-1 text-[7.5px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                Growing Together
              </p>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
                {tab === "signin" ? "Welcome back." : "Create your account."}
              </h1>
              <p className="mt-1.5 text-[0.88rem] text-[var(--muted)]">
                {tab === "signin"
                  ? "Sign in to access your Okelcor account."
                  : "Join Okelcor and start sourcing tyres globally."}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="mb-7 flex rounded-[12px] bg-[#efefef] p-1">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`flex-1 rounded-[10px] py-2.5 text-[0.88rem] font-semibold transition ${
                  tab === "signin"
                    ? "bg-white text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={`flex-1 rounded-[10px] py-2.5 text-[0.88rem] font-semibold transition ${
                  tab === "signup"
                    ? "bg-white text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            {tab === "signin" ? <SignInForm /> : <SignUpForm />}

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/[0.07]" />
              <span className="text-[0.75rem] text-[var(--muted)]">or</span>
              <div className="h-px flex-1 bg-black/[0.07]" />
            </div>

            {/* Guest CTA */}
            <Link
              href="/shop"
              className="flex h-[50px] w-full items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
            >
              Continue as Guest
            </Link>

            <p className="mt-5 text-center text-[0.78rem] text-[var(--muted)]">
              Need help?{" "}
              <Link href="/contact" className="font-medium text-[var(--foreground)] hover:text-[var(--primary)]">
                Contact our team
              </Link>
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}
