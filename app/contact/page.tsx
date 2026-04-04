"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Printer, Mail, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import { getConsent, setConsent, CONSENT_EVENT, type ConsentValue } from "@/lib/cookie-consent";
import { trackContactSubmit } from "@/lib/analytics";
import { COMPANY_EMAIL, COMPANY_PHONE, COMPANY_FAX, COMPANY_ADDRESS_STREET, COMPANY_ADDRESS_CITY, COMPANY_ADDRESS_COUNTRY } from "@/lib/constants";
import { useSiteSettings } from "@/context/site-settings-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  name: string;
  email: string;
  subject: string;
  inquiry: string;
};

type FormErrors = Partial<FormData>;

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-[12px] border border-black/[0.08] bg-white px-4 py-3.5 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10";

const inputErrCls =
  "w-full rounded-[12px] border border-red-400 bg-red-50/50 px-4 py-3.5 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-red-500";

// ─── Data ─────────────────────────────────────────────────────────────────────

import { useLanguage } from "@/context/language-context";

const INFO_ICONS = [MapPin, Phone, Printer, Mail, Clock];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const { t } = useLanguage();
  const s = useSiteSettings();
  const [form, setForm] = useState<FormData>({ name: "", email: "", subject: "", inquiry: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mapConsent, setMapConsent] = useState<ConsentValue | null>(null);

  const INFO_ITEMS = [
    {
      Icon: INFO_ICONS[0], label: t.contact.infoAddress,
      lines: s.company_address
        ? [s.company_address]
        : [COMPANY_ADDRESS_STREET, `${COMPANY_ADDRESS_CITY}, ${COMPANY_ADDRESS_COUNTRY}`],
    },
    { Icon: INFO_ICONS[1], label: t.contact.infoPhone, lines: [s.company_phone  ?? COMPANY_PHONE] },
    { Icon: INFO_ICONS[2], label: t.contact.infoFax,   lines: [s.company_fax    ?? COMPANY_FAX] },
    { Icon: INFO_ICONS[3], label: t.contact.infoEmail, lines: [s.company_email  ?? COMPANY_EMAIL] },
    { Icon: INFO_ICONS[4], label: t.contact.infoHours, lines: ["Mon \u2013 Fri: 08:00 \u2013 17:00 CET"] },
  ];

  useEffect(() => {
    setMapConsent(getConsent());
    const handler = () => setMapConsent(getConsent());
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = t.contact.errName;
    if (!form.email.trim()) errs.email = t.contact.errEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = t.contact.errEmailInvalid;
    if (!form.subject.trim()) errs.subject = t.contact.errSubject;
    if (!form.inquiry.trim()) errs.inquiry = t.contact.errInquiry;
    return errs;
  };

  const set =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Something went wrong. Please try again.");
      }

      trackContactSubmit();
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t.contact.errGeneric
      );
    } finally {
      setSubmitting(false);
    }
  };

  const ic = (key: keyof FormData) => (errors[key] ? inputErrCls : inputCls);

  return (
    <main>
      <Navbar />

      {/* ── Hero ── */}
      <PageHero
        eyebrow={t.contact.hero.eyebrow}
        title={t.contact.hero.title}
        subtitle={t.contact.hero.subtitle}
        image="/images/pexels-albinberlin-919073.jpg"
      />

      {/* ── Contact grid ── */}
      <section className="w-full bg-[#f5f5f5] py-10 md:py-16">
        <div className="tesla-shell">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">

            {/* Left column */}
            <div className="flex flex-col gap-5">

              {/* Contact details */}
              <div className="rounded-[22px] bg-[#efefef] p-6 sm:p-8 md:p-10">
                <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                  {t.contact.officeEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-[1.75rem]">
                  OKELCOR GmbH
                </h2>
                <p className="mt-1 text-[0.88rem] text-[var(--muted)]">
                  {t.contact.officeTagline}
                </p>

                <div className="mt-8 flex flex-col gap-6">
                  {INFO_ITEMS.map(({ Icon, label, lines }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                        <Icon size={15} strokeWidth={1.8} className="text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                          {label}
                        </p>
                        {lines.map((line) => (
                          <p key={line} className="mt-0.5 text-[0.92rem] font-medium text-[var(--foreground)]">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What we handle */}
              <div className="rounded-[22px] bg-[#efefef] p-6 sm:p-8 md:p-10">
                <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                  {t.contact.helpEyebrow}
                </p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-[var(--foreground)]">
                  {t.contact.helpHeading}
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {t.contact.helpItems.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                      </span>
                      <span className="text-[0.9rem] text-[var(--muted)]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Right column — form */}
            <div className="rounded-[22px] bg-[#efefef] p-6 sm:p-8 md:p-10 lg:p-12">
              {submitted ? (
                <div className="flex min-h-[480px] flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-2xl font-extrabold text-[var(--foreground)]">
                    {t.contact.successTitle}
                  </h3>
                  <p className="mt-3 max-w-sm text-[0.95rem] leading-7 text-[var(--muted)]">
                    {t.contact.successBody}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", subject: "", inquiry: "" });
                    }}
                    className="mt-8 rounded-full bg-[var(--primary)] px-8 py-3 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                  >
                    {t.contact.successButton}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                    {t.contact.formEyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
                    {t.contact.formHeading}
                  </h2>
                  <p className="mt-2 text-[0.9rem] leading-6 text-[var(--muted)]">
                    {t.contact.formTagline}
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">

                    {/* Name + Email */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-name" className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                          {t.contact.labelName}
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          placeholder={t.contact.placeholderName}
                          value={form.name}
                          onChange={set("name")}
                          aria-describedby={errors.name ? "contact-name-error" : undefined}
                          aria-invalid={!!errors.name}
                          className={ic("name")}
                        />
                        {errors.name && (
                          <p id="contact-name-error" role="alert" className="mt-1 text-[0.75rem] text-red-500">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                          {t.contact.labelEmail}
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          placeholder={t.contact.placeholderEmail}
                          value={form.email}
                          onChange={set("email")}
                          aria-describedby={errors.email ? "contact-email-error" : undefined}
                          aria-invalid={!!errors.email}
                          className={ic("email")}
                        />
                        {errors.email && (
                          <p id="contact-email-error" role="alert" className="mt-1 text-[0.75rem] text-red-500">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="contact-subject" className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                        {t.contact.labelSubject}
                      </label>
                      <select
                        id="contact-subject"
                        value={form.subject}
                        onChange={set("subject")}
                        aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                        aria-invalid={!!errors.subject}
                        className={ic("subject")}
                      >
                        <option value="">{t.contact.placeholderSelect}</option>
                        {t.contact.topics.map((topic) => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p id="contact-subject-error" role="alert" className="mt-1 text-[0.75rem] text-red-500">{errors.subject}</p>
                      )}
                    </div>

                    {/* Inquiry */}
                    <div>
                      <label htmlFor="contact-inquiry" className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                        {t.contact.labelInquiry}
                      </label>
                      <textarea
                        id="contact-inquiry"
                        placeholder={t.contact.placeholderInquiry}
                        value={form.inquiry}
                        onChange={set("inquiry")}
                        rows={6}
                        aria-describedby={errors.inquiry ? "contact-inquiry-error" : undefined}
                        aria-invalid={!!errors.inquiry}
                        className={`${ic("inquiry")} resize-none`}
                      />
                      {errors.inquiry && (
                        <p id="contact-inquiry-error" role="alert" className="mt-1 text-[0.75rem] text-red-500">{errors.inquiry}</p>
                      )}
                    </div>

                    {/* Submit error */}
                    {submitError && (
                      <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
                        {submitError}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--primary)] text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          {t.contact.sending}
                        </span>
                      ) : (
                        t.contact.submit
                      )}
                    </button>

                    <p className="text-center text-[0.78rem] text-[var(--muted)]">
                      {t.contact.responseNote}
                    </p>

                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Map section ── */}
      <section className="w-full bg-[#f5f5f5] pb-10 md:pb-14">
        <div className="tesla-shell">

          {/* Section header */}
          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
              {t.contact.mapEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl">
              {t.contact.mapHeading}
            </h2>
          </div>

          {/* Map container */}
          <div className="relative overflow-hidden rounded-[22px]">
            {mapConsent === "accepted" ? (
              <div className="h-[300px] sm:h-[380px] md:h-[480px]">
                <iframe
                  title="Okelcor Munich Office"
                  src="https://maps.google.com/maps?q=Landsberger+Strasse+155,+80687+Munich,+Germany&output=embed&z=15"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center gap-5 rounded-[22px] bg-[#efefef] px-6 text-center sm:h-[380px] md:h-[480px]">
                <MapPin size={36} strokeWidth={1.6} className="text-[var(--muted)]" />
                <div>
                  <p className="text-[1rem] font-semibold text-[var(--foreground)]">
                    {t.contact.mapConsentTitle}
                  </p>
                  <p className="mt-1.5 max-w-xs text-[0.88rem] leading-6 text-[var(--muted)]">
                    {t.contact.mapConsentBody}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConsent("accepted")}
                  className="inline-flex h-[48px] items-center justify-center rounded-full bg-[var(--primary)] px-6 text-[0.88rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                >
                  {t.contact.mapEnableBtn}
                </button>
                <p className="text-[0.78rem] text-[var(--muted)]">
                  {COMPANY_ADDRESS_STREET}, {COMPANY_ADDRESS_CITY}, {COMPANY_ADDRESS_COUNTRY}
                </p>
              </div>
            )}

            {/* Address overlay card — only shown when map is live */}
            {mapConsent === "accepted" && (
              <div className="absolute bottom-5 left-5 max-w-[220px] rounded-[16px] bg-white px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.14)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
                  OKELCOR GmbH
                </p>
                <p className="mt-1.5 text-[0.88rem] font-semibold leading-5 text-[var(--foreground)]">
                  {COMPANY_ADDRESS_STREET}
                </p>
                <p className="text-[0.85rem] leading-5 text-[var(--muted)]">
                  {COMPANY_ADDRESS_CITY}, {COMPANY_ADDRESS_COUNTRY}
                </p>
                <div className="mt-3 h-px bg-black/[0.06]" />
                <p className="mt-2.5 text-[0.8rem] text-[var(--muted)]">
                  Mon – Fri: 08:00 – 17:00 CET
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
