"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, Check } from "lucide-react";
import Navbar from "@/components/navbar";
import { useLanguage } from "@/context/language-context";

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

// ─── Password field with visibility toggle ─────────────────────────────────

function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
  error,
  showLabel,
  hideLabel,
}: {
  id?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showLabel: string;
  hideLabel: string;
}) {
  const [show, setShow] = useState(false);
  const errorId = id ? `${id}-error` : undefined;
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-describedby={error && errorId ? errorId : undefined}
          aria-invalid={!!error}
          className={`${error ? inputErrCls : inputCls} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
          aria-label={show ? hideLabel : showLabel}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p id={errorId} role="alert" className="mt-1 text-[0.75rem] text-red-500">{error}</p>}
    </div>
  );
}

// ─── Field wrapper ──────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
        {label}
      </label>
      {children}
      {error && <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="mt-1 text-[0.75rem] text-red-500">{error}</p>}
    </div>
  );
}

// ─── Sign In Form ──────────────────────────────────────────────────────────

function SignInForm() {
  const { t } = useLanguage();
  const a = t.auth;
  const searchParams = useSearchParams();

  // callbackUrl is set by middleware when redirecting unauthenticated users
  // (e.g. /auth?callbackUrl=/checkout). NextAuth uses it to redirect back
  // after a successful sign-in. Falls back to / if not present.
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [form, setForm] = useState<SignInData>({ email: "", password: "" });
  const [errors, setErrors] = useState<SignInErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof SignInData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
      if (authError) setAuthError(null);
    };

  const validate = (): SignInErrors => {
    const errs: SignInErrors = {};
    if (!form.email.trim()) errs.email = a.errEmailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = a.errEmailInvalid;
    if (!form.password) errs.password = a.errPasswordRequired;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setAuthError(null);

    // redirect: false — handle result in JS instead of letting NextAuth
    // do a hard server redirect. This lets us show inline errors on failure.
    //
    // callbackUrl is forwarded so NextAuth can:
    //   a) validate it is same-origin (open-redirect protection)
    //   b) populate result.url with the sanitised destination
    //
    // On success we navigate to result.url (NextAuth's resolved URL) and
    // fall back to the raw callbackUrl only if result.url is absent.
    const result = await signIn("credentials", {
      email:       form.email,
      password:    form.password,
      redirect:    false,
      callbackUrl,
    });

    setSubmitting(false);

    if (result?.ok) {
      // Use NextAuth's sanitised result.url — never navigate to a raw
      // user-supplied string without this validation step.
      window.location.href = result.url ?? callbackUrl;
    } else {
      // result.error is "CredentialsSignin" for invalid credentials.
      setAuthError("Invalid email or password. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Auth-level error (wrong credentials) — shown above the fields */}
      {authError && (
        <div
          role="alert"
          className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[0.83rem] text-red-600"
        >
          {authError}
        </div>
      )}

      <Field label={a.labelEmail} htmlFor="signin-email" error={errors.email}>
        <input
          id="signin-email"
          type="email"
          placeholder={a.placeholderEmail}
          value={form.email}
          onChange={set("email")}
          aria-describedby={errors.email ? "signin-email-error" : undefined}
          aria-invalid={!!errors.email}
          className={errors.email ? inputErrCls : inputCls}
        />
      </Field>

      <Field label={a.labelPassword} htmlFor="signin-password" error={undefined}>
        <PasswordInput
          id="signin-password"
          placeholder={a.placeholderPassword}
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          showLabel={a.showPassword}
          hideLabel={a.hidePassword}
        />
      </Field>

      <div className="flex justify-end">
        <button
          type="button"
          className="text-[0.8rem] font-medium text-[var(--muted)] transition hover:text-[var(--primary)]"
        >
          {a.forgotPassword}
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
            {a.signingIn}
          </span>
        ) : (
          a.signIn
        )}
      </button>
    </form>
  );
}

// ─── Sign Up Form ──────────────────────────────────────────────────────────

function SignUpForm() {
  const { t } = useLanguage();
  const a = t.auth;

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
    if (!form.fullName.trim()) errs.fullName = a.errFullNameRequired;
    if (!form.email.trim()) errs.email = a.errEmailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = a.errEmailInvalid;
    if (!form.password) errs.password = a.errPasswordRequired;
    else if (form.password.length < 8) errs.password = a.errPasswordMin;
    if (!form.confirmPassword) errs.confirmPassword = a.errConfirmRequired;
    else if (form.password !== form.confirmPassword) errs.confirmPassword = a.errPasswordMismatch;
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
          {a.signUpSuccessTitle}
        </h3>
        <p className="mt-2 text-[0.88rem] leading-6 text-[var(--muted)]">
          {a.signUpSuccessBody}
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-[50px] w-full items-center justify-center rounded-full bg-[var(--primary)] text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          {a.browseCatalogue}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field label={a.labelFullName} htmlFor="signup-fullName" error={errors.fullName}>
        <input
          id="signup-fullName"
          type="text"
          placeholder={a.placeholderFullName}
          value={form.fullName}
          onChange={set("fullName")}
          aria-describedby={errors.fullName ? "signup-fullName-error" : undefined}
          aria-invalid={!!errors.fullName}
          className={errors.fullName ? inputErrCls : inputCls}
        />
      </Field>

      <Field label={a.labelCompanyName} htmlFor="signup-companyName" error={errors.companyName}>
        <input
          id="signup-companyName"
          type="text"
          placeholder={a.placeholderCompanyName}
          value={form.companyName}
          onChange={set("companyName")}
          className={inputCls}
        />
      </Field>

      <Field label={a.labelEmail} htmlFor="signup-email" error={errors.email}>
        <input
          id="signup-email"
          type="email"
          placeholder={a.placeholderEmail}
          value={form.email}
          onChange={set("email")}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
          aria-invalid={!!errors.email}
          className={errors.email ? inputErrCls : inputCls}
        />
      </Field>

      <Field label={a.labelPassword} htmlFor="signup-password" error={undefined}>
        <PasswordInput
          id="signup-password"
          placeholder={a.placeholderPasswordMin}
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          showLabel={a.showPassword}
          hideLabel={a.hidePassword}
        />
      </Field>

      <Field label={a.labelConfirmPassword} htmlFor="signup-confirmPassword" error={undefined}>
        <PasswordInput
          id="signup-confirmPassword"
          placeholder={a.placeholderConfirmPassword}
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
          showLabel={a.showPassword}
          hideLabel={a.hidePassword}
        />
      </Field>

      <p className="text-[0.78rem] leading-5 text-[var(--muted)]">
        {a.termsNote}{" "}
        <span className="font-medium text-[var(--foreground)]">{a.termsLabel}</span>{" "}
        {a.termsNoteAnd}{" "}
        <span className="font-medium text-[var(--foreground)]">{a.privacyLabel}</span>.
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
            {a.creatingAccount}
          </span>
        ) : (
          a.createAccount
        )}
      </button>
    </form>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const { t } = useLanguage();
  const a = t.auth;

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
                "url('/images/tyre-stack.jpg')",
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
                {a.panelHeading}
              </h2>
              <p className="mt-4 text-[1rem] leading-7 text-white/75">
                {a.panelSubtitle}
              </p>

              <ul className="mt-8 flex flex-col gap-3.5">
                {a.trustPoints.map((point) => (
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
              {a.copyright}
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
                {tab === "signin" ? a.headingSignIn : a.headingSignUp}
              </h1>
              <p className="mt-1.5 text-[0.88rem] text-[var(--muted)]">
                {tab === "signin" ? a.subtitleSignIn : a.subtitleSignUp}
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
                {a.tabSignIn}
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
                {a.tabCreateAccount}
              </button>
            </div>

            {/* Form */}
            {tab === "signin" ? <SignInForm /> : <SignUpForm />}

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/[0.07]" />
              <span className="text-[0.75rem] text-[var(--muted)]">{a.or}</span>
              <div className="h-px flex-1 bg-black/[0.07]" />
            </div>

            {/* Guest CTA */}
            <Link
              href="/shop"
              className="flex h-[50px] w-full items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
            >
              {a.continueAsGuest}
            </Link>

            <p className="mt-5 text-center text-[0.78rem] text-[var(--muted)]">
              {a.needHelp}{" "}
              <Link href="/contact" className="font-medium text-[var(--foreground)] hover:text-[var(--primary)]">
                {a.contactTeam}
              </Link>
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}
