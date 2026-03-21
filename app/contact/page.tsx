"use client";

import { useState } from "react";
import { MapPin, Phone, Printer, Mail, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

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
  "w-full rounded-[12px] border border-black/[0.08] bg-white px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10";

const inputErrCls =
  "w-full rounded-[12px] border border-red-400 bg-red-50/50 px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-red-500";

// ─── Data ─────────────────────────────────────────────────────────────────────

const INFO_ITEMS = [
  { Icon: MapPin,   label: "Address",        lines: ["Landsberger Str. 155", "80687 Munich, Germany"] },
  { Icon: Phone,    label: "Phone",           lines: ["+49 (0) 89 / 545 583 60"] },
  { Icon: Printer,  label: "Fax",             lines: ["+49 (0) 89 / 545 583 33"] },
  { Icon: Mail,     label: "Email",           lines: ["info@okelcor.de"] },
  { Icon: Clock,    label: "Business Hours",  lines: ["Mon – Fri: 08:00 – 17:00 CET"] },
];

const TOPICS = [
  "Wholesale Pricing",
  "Tyre Sourcing",
  "Logistics & Shipping",
  "Catalogue Access",
  "Partnership",
  "After Sales Support",
  "Other",
];

const HELP_ITEMS = [
  "Wholesale pricing & bulk orders",
  "PCR, TBR, LT & used tyre sourcing",
  "International logistics coordination",
  "REX certified export documentation",
  "After-sales claims & support",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({ name: "", email: "", subject: "", inquiry: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.subject.trim()) errs.subject = "Please select a subject";
    if (!form.inquiry.trim()) errs.inquiry = "Please describe your inquiry";
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
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
  };

  const ic = (key: keyof FormData) => (errors[key] ? inputErrCls : inputCls);

  return (
    <main>
      <Navbar />

      {/* ── Hero ── */}
      <PageHero
        eyebrow="Contact"
        title="Talk to us about your next tyre supply order."
        subtitle="Reach out for catalogue access, wholesale pricing, sourcing support, and partnership discussions."
        image="https://i.pinimg.com/1200x/73/b9/ff/73b9ffbcfe6b85f54937a5b07a9f76c7.jpg"
      />

      {/* ── Contact grid ── */}
      <section className="w-full bg-[#f5f5f5] py-10 md:py-16">
        <div className="tesla-shell">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">

            {/* Left column */}
            <div className="flex flex-col gap-5">

              {/* Contact details */}
              <div className="rounded-[22px] bg-[#efefef] p-8 md:p-10">
                <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                  Our Office
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-[1.75rem]">
                  OKELCOR GmbH
                </h2>
                <p className="mt-1 text-[0.88rem] text-[var(--muted)]">
                  Global tyre supply — Munich headquarters
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
              <div className="rounded-[22px] bg-[#efefef] p-8 md:p-10">
                <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                  We Can Help With
                </p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-[var(--foreground)]">
                  From enquiry to delivery.
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {HELP_ITEMS.map((item) => (
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
            <div className="rounded-[22px] bg-[#efefef] p-8 md:p-10 lg:p-12">
              {submitted ? (
                <div className="flex min-h-[480px] flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-2xl font-extrabold text-[var(--foreground)]">
                    Message Sent
                  </h3>
                  <p className="mt-3 max-w-sm text-[0.95rem] leading-7 text-[var(--muted)]">
                    Thank you for reaching out. Our team will respond to your
                    inquiry within one business day.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", subject: "", inquiry: "" });
                    }}
                    className="mt-8 rounded-full bg-[var(--primary)] px-8 py-3 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                    Send a Message
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
                    Quick Inquiry
                  </h2>
                  <p className="mt-2 text-[0.9rem] leading-6 text-[var(--muted)]">
                    Fill in the form and we&apos;ll get back to you promptly.
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">

                    {/* Name + Email */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="John Smith"
                          value={form.name}
                          onChange={set("name")}
                          className={ic("name")}
                        />
                        {errors.name && (
                          <p className="mt-1 text-[0.75rem] text-red-500">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="john@company.com"
                          value={form.email}
                          onChange={set("email")}
                          className={ic("email")}
                        />
                        {errors.email && (
                          <p className="mt-1 text-[0.75rem] text-red-500">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                        Subject
                      </label>
                      <select
                        value={form.subject}
                        onChange={set("subject")}
                        className={ic("subject")}
                      >
                        <option value="">Select a topic</option>
                        {TOPICS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-[0.75rem] text-red-500">{errors.subject}</p>
                      )}
                    </div>

                    {/* Inquiry */}
                    <div>
                      <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                        Inquiry Message
                      </label>
                      <textarea
                        placeholder="Describe your tyre supply requirements, volumes, or any questions you have…"
                        value={form.inquiry}
                        onChange={set("inquiry")}
                        rows={6}
                        className={`${ic("inquiry")} resize-none`}
                      />
                      {errors.inquiry && (
                        <p className="mt-1 text-[0.75rem] text-red-500">{errors.inquiry}</p>
                      )}
                    </div>

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
                          Sending…
                        </span>
                      ) : (
                        "Send Message"
                      )}
                    </button>

                    <p className="text-center text-[0.78rem] text-[var(--muted)]">
                      We typically respond within one business day.
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
              Our Location
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl">
              Find us in Munich.
            </h2>
          </div>

          {/* Map container */}
          <div className="relative overflow-hidden rounded-[22px]">
            <iframe
              title="Okelcor Munich Office"
              src="https://maps.google.com/maps?q=Landsberger+Strasse+155,+80687+Munich,+Germany&output=embed&z=15"
              width="100%"
              height="480"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Address overlay card */}
            <div className="absolute bottom-5 left-5 max-w-[220px] rounded-[16px] bg-white px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.14)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
                OKELCOR GmbH
              </p>
              <p className="mt-1.5 text-[0.88rem] font-semibold leading-5 text-[var(--foreground)]">
                Landsberger Str. 155
              </p>
              <p className="text-[0.85rem] leading-5 text-[var(--muted)]">
                80687 Munich, Germany
              </p>
              <div className="mt-3 h-px bg-black/[0.06]" />
              <p className="mt-2.5 text-[0.8rem] text-[var(--muted)]">
                Mon – Fri: 08:00 – 17:00 CET
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
