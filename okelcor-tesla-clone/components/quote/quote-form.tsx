"use client";

import { useState } from "react";
import { Paperclip, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  businessType: string;
  tyreCategory: string;
  brandPreference: string;
  tyreSize: string;
  quantity: string;
  budgetRange: string;
  deliveryLocation: string;
  deliveryTimeline: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const REQUIRED: (keyof FormData)[] = [
  "fullName",
  "email",
  "country",
  "tyreCategory",
  "quantity",
  "deliveryLocation",
  "notes",
];

// ─── Select options ───────────────────────────────────────────────────────────

const BUSINESS_TYPES = ["Wholesaler", "Distributor", "Retailer", "Fleet Operator", "Individual Buyer", "Other"];
const TYRE_CATEGORIES = ["PCR Tyres", "TBR Tyres", "Used Tyres", "Mixed Request"];
const BUDGET_RANGES = ["Under €1,000", "€1,000 – €5,000", "€5,000 – €20,000", "€20,000 – €50,000", "€50,000+", "Prefer not to say"];
const TIMELINES = ["As soon as possible", "Within 1 week", "Within 1 month", "Flexible"];

const COUNTRIES = [
  "Germany", "United Kingdom", "Netherlands", "Belgium", "France", "Italy", "Spain",
  "Sweden", "Poland", "Austria", "Switzerland", "United States", "Canada",
  "United Arab Emirates", "Saudi Arabia", "Nigeria", "South Africa", "Kenya",
  "Uganda", "Tanzania", "Singapore", "China", "India", "Japan", "Australia",
];

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-[12px] border border-black/[0.08] bg-white px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10";

const inputErrCls =
  "w-full rounded-[12px] border border-red-400 bg-red-50/50 px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-red-500";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--primary)]">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[0.75rem] text-red-500">{error}</p>}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-full text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
      {children}
    </p>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function QuoteForm() {
  const [form, setForm] = useState<FormData>({
    fullName: "", companyName: "", email: "", phone: "",
    country: "", businessType: "",
    tyreCategory: "", brandPreference: "", tyreSize: "",
    quantity: "", budgetRange: "", deliveryLocation: "",
    deliveryTimeline: "", notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  // ── Helpers ──────────────────────────────────────────────────────────────

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const ic = (key: keyof FormData) => (errors[key] ? inputErrCls : inputCls);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.country) errs.country = "Please select a country";
    if (!form.tyreCategory) errs.tyreCategory = "Please select a tyre category";
    if (!form.quantity.trim()) errs.quantity = "Quantity is required";
    if (!form.deliveryLocation.trim()) errs.deliveryLocation = "Delivery location is required";
    if (!form.notes.trim()) errs.notes = "Please describe your requirements";
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstErrKey = REQUIRED.find((k) => errs[k]);
      if (firstErrKey) {
        document.getElementById(`field-${firstErrKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    const ref = `OKL-QR-${Date.now().toString().slice(-6)}`;
    setRefNumber(ref);
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({
      fullName: "", companyName: "", email: "", phone: "",
      country: "", businessType: "",
      tyreCategory: "", brandPreference: "", tyreSize: "",
      quantity: "", budgetRange: "", deliveryLocation: "",
      deliveryTimeline: "", notes: "",
    });
    setErrors({});
  };

  // ── Success state ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-[22px] bg-[#efefef] px-8 py-16 text-center md:px-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={32} strokeWidth={1.5} className="text-green-500" />
        </div>
        <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
          Quote Request Received
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-7 text-[var(--muted)]">
          Your quote request has been received. Our team will review your
          requirements and contact you with a tailored quotation within one
          business day.
        </p>
        <div className="mt-6 rounded-[14px] bg-white px-6 py-4">
          <p className="text-[0.78rem] text-[var(--muted)]">Reference number</p>
          <p className="mt-0.5 text-[1.2rem] font-extrabold tracking-wider text-[var(--foreground)]">
            {refNumber}
          </p>
        </div>
        <p className="mt-4 text-[0.82rem] text-[var(--muted)]">
          Please keep this reference for any follow-up with our team.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-8 rounded-full bg-[var(--primary)] px-8 py-3 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-[22px] bg-[#efefef] p-7 md:p-10">
      <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
        Quote Request Form
      </p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
        Tell us what you need.
      </h2>
      <p className="mt-1.5 text-[0.88rem] text-[var(--muted)]">
        Fields marked <span className="text-[var(--primary)]">*</span> are required.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* ── Business Information ── */}
          <SectionLabel>Business / Customer Information</SectionLabel>

          <Field label="Full Name" required error={errors.fullName}>
            <div id="field-fullName">
              <input
                type="text"
                placeholder="John Smith"
                value={form.fullName}
                onChange={set("fullName")}
                className={ic("fullName")}
              />
            </div>
          </Field>

          <Field label="Company Name" error={errors.companyName}>
            <input
              type="text"
              placeholder="Acme Tyres GmbH"
              value={form.companyName}
              onChange={set("companyName")}
              className={ic("companyName")}
            />
          </Field>

          <Field label="Email Address" required error={errors.email}>
            <div id="field-email">
              <input
                type="email"
                placeholder="john@company.com"
                value={form.email}
                onChange={set("email")}
                className={ic("email")}
              />
            </div>
          </Field>

          <Field label="Phone Number" error={errors.phone}>
            <input
              type="tel"
              placeholder="+49 89 000 0000"
              value={form.phone}
              onChange={set("phone")}
              className={ic("phone")}
            />
          </Field>

          <Field label="Country / Region" required error={errors.country}>
            <div id="field-country">
              <select value={form.country} onChange={set("country")} className={ic("country")}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Field>

          <Field label="Business Type" error={errors.businessType}>
            <select value={form.businessType} onChange={set("businessType")} className={ic("businessType")}>
              <option value="">Select type</option>
              {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          {/* ── Product Request ── */}
          <SectionLabel>Product Request Information</SectionLabel>

          <Field label="Tyre Category" required error={errors.tyreCategory}>
            <div id="field-tyreCategory">
              <select value={form.tyreCategory} onChange={set("tyreCategory")} className={ic("tyreCategory")}>
                <option value="">Select category</option>
                {TYRE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Field>

          <Field label="Brand Preference" error={errors.brandPreference}>
            <input
              type="text"
              placeholder="e.g. Michelin, Bridgestone, Any"
              value={form.brandPreference}
              onChange={set("brandPreference")}
              className={ic("brandPreference")}
            />
          </Field>

          <Field label="Tyre Size / Specification" error={errors.tyreSize}>
            <input
              type="text"
              placeholder="e.g. 205/55R16 91H or 295/80R22.5"
              value={form.tyreSize}
              onChange={set("tyreSize")}
              className={ic("tyreSize")}
            />
          </Field>

          <Field label="Quantity Needed" required error={errors.quantity}>
            <div id="field-quantity">
              <input
                type="text"
                placeholder="e.g. 500 units, 2 containers"
                value={form.quantity}
                onChange={set("quantity")}
                className={ic("quantity")}
              />
            </div>
          </Field>

          <Field label="Budget Range" error={errors.budgetRange}>
            <select value={form.budgetRange} onChange={set("budgetRange")} className={ic("budgetRange")}>
              <option value="">Select range</option>
              {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>

          <Field label="Required Delivery Timeline" error={errors.deliveryTimeline}>
            <select value={form.deliveryTimeline} onChange={set("deliveryTimeline")} className={ic("deliveryTimeline")}>
              <option value="">Select timeline</option>
              {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Preferred Delivery Location" required error={errors.deliveryLocation} >
            <div id="field-deliveryLocation" className="col-span-full">
              <input
                type="text"
                placeholder="e.g. Hamburg Port, Lagos, Dubai — include port or city"
                value={form.deliveryLocation}
                onChange={set("deliveryLocation")}
                className={ic("deliveryLocation")}
              />
            </div>
          </Field>

          <Field label="Additional Notes / Inquiry" required error={errors.notes}>
            <div id="field-notes" className="col-span-full">
              <textarea
                placeholder="Describe your requirements in detail — tyre specs, intended use, volume, any other relevant information…"
                value={form.notes}
                onChange={set("notes")}
                rows={5}
                className={`${ic("notes")} resize-none`}
              />
            </div>
          </Field>

          {/* ── File upload placeholder ── */}
          <div className="col-span-full">
            <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
              Upload Product List / Specification Sheet
              <span className="ml-2 text-[0.75rem] font-normal text-[var(--muted)]">(optional — coming soon)</span>
            </label>
            <div className="flex cursor-not-allowed items-center gap-3 rounded-[12px] border border-dashed border-black/[0.12] bg-white/60 px-4 py-4 opacity-50">
              <Paperclip size={16} className="shrink-0 text-[var(--muted)]" />
              <span className="text-[0.88rem] text-[var(--muted)]">
                Drag & drop or click to upload — PDF, XLS, CSV accepted
              </span>
            </div>
          </div>

        </div>

        {/* Submit */}
        <div className="mt-7">
          <button
            type="submit"
            disabled={submitting}
            className="flex h-[54px] w-full items-center justify-center rounded-full bg-[var(--primary)] text-[1rem] font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            {submitting ? (
              <span className="flex items-center gap-2.5">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting Request…
              </span>
            ) : (
              "Submit Quote Request"
            )}
          </button>
          <p className="mt-3 text-center text-[0.78rem] text-[var(--muted)]">
            We respond to all requests within one business day. Your information is kept strictly confidential.
          </p>
        </div>
      </form>
    </div>
  );
}
