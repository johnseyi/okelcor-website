"use client";

import { useState, useRef } from "react";
import { Paperclip, CheckCircle2, X } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { trackQuoteSubmit } from "@/lib/analytics";
import VatField from "@/components/vat-field";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

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
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string;
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

const COUNTRIES = [
  "Germany", "United Kingdom", "Netherlands", "Belgium", "France", "Italy", "Spain",
  "Sweden", "Poland", "Austria", "Switzerland", "United States", "Canada",
  "United Arab Emirates", "Saudi Arabia", "Nigeria", "South Africa", "Kenya",
  "Uganda", "Tanzania", "Singapore", "China", "India", "Japan", "Australia",
];

// ─── File upload helpers ──────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS = ["pdf", "csv", "xls", "xlsx"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-[12px] border border-black/[0.08] bg-white px-4 py-3.5 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10";

const inputErrCls =
  "w-full rounded-[12px] border border-red-400 bg-red-50/50 px-4 py-3.5 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-red-500";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--primary)]">*</span>}
      </label>
      {children}
      {error && <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="mt-1 text-[0.75rem] text-red-500">{error}</p>}
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
  const { t } = useLanguage();
  const { customer } = useCustomerAuth();
  const showVatField = customer?.customer_type === "b2b";

  const [form, setForm] = useState<FormData>({
    fullName: "", companyName: "", email: "", phone: "",
    country: "", businessType: "",
    tyreCategory: "", brandPreference: "", tyreSize: "",
    quantity: "", budgetRange: "",
    deliveryAddress: "", deliveryCity: "", deliveryPostalCode: "",
    deliveryLocation: "", deliveryTimeline: "", notes: "",
  });
  const [vatNumber, setVatNumber] = useState("");
  const [vatValid, setVatValid] = useState(false);
  const [vatError, setVatError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const ic = (key: keyof FormData) => (errors[key] ? inputErrCls : inputCls);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.fullName.trim()) errs.fullName = t.quote.form.errFullName;
    if (!form.email.trim()) errs.email = t.quote.form.errEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = t.quote.form.errEmailInvalid;
    if (!form.country) errs.country = t.quote.form.errCountry;
    if (!form.tyreCategory) errs.tyreCategory = t.quote.form.errCategory;
    if (!form.quantity.trim()) errs.quantity = t.quote.form.errQuantity;
    if (!form.deliveryLocation.trim()) errs.deliveryLocation = t.quote.form.errDelivery;
    if (!form.notes.trim()) errs.notes = t.quote.form.errNotes;
    return errs;
  };

  // ── File handlers ────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFileError(null);
    if (!file) { setAttachedFile(null); return; }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFileError("Only PDF, CSV, XLS, and XLSX files are accepted.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("File must be smaller than 10 MB.");
      e.target.value = "";
      return;
    }
    setAttachedFile(file);
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    if (showVatField && !vatValid) {
      setVatError("Please validate your VAT number before submitting.");
      document.getElementById("field-vatNumber")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      let res: Response;

      if (attachedFile) {
        // Multipart — proxy detects content-type and forwards as FormData to Laravel
        const fd = new FormData();
        fd.append("full_name",          form.fullName);
        fd.append("company_name",       form.companyName);
        fd.append("email",              form.email);
        fd.append("phone",              form.phone);
        fd.append("country",            form.country);
        fd.append("business_type",      form.businessType);
        fd.append("tyre_category",      form.tyreCategory);
        fd.append("brand_preference",   form.brandPreference);
        fd.append("tyre_size",          form.tyreSize);
        fd.append("quantity",             form.quantity);
        fd.append("budget_range",         form.budgetRange);
        fd.append("delivery_address",     form.deliveryAddress);
        fd.append("delivery_city",        form.deliveryCity);
        fd.append("delivery_postal_code", form.deliveryPostalCode);
        fd.append("delivery_location",    form.deliveryLocation);
        fd.append("delivery_timeline",    form.deliveryTimeline);
        fd.append("notes",              form.notes);
        if (vatNumber.trim()) fd.append("vat_number", vatNumber.trim());
        fd.append("attachment", attachedFile);
        res = await fetch("/api/customer/quote-requests", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/customer/quote-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name:         form.fullName,
            company_name:      form.companyName,
            email:             form.email,
            phone:             form.phone,
            country:           form.country,
            business_type:     form.businessType,
            tyre_category:     form.tyreCategory,
            brand_preference:  form.brandPreference,
            tyre_size:         form.tyreSize,
            quantity:             form.quantity,
            budget_range:         form.budgetRange,
            delivery_address:     form.deliveryAddress,
            delivery_city:        form.deliveryCity,
            delivery_postal_code: form.deliveryPostalCode,
            delivery_location:    form.deliveryLocation,
            delivery_timeline:    form.deliveryTimeline,
            notes:             form.notes,
            vat_number:        vatNumber.trim() || undefined,
          }),
        });
      }

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Something went wrong. Please try again.");
      }

      setRefNumber(json.data?.ref_number ?? `OKL-QR-${Date.now().toString().slice(-6)}`);
      trackQuoteSubmit({ tyreCategory: form.tyreCategory, country: form.country });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t.quote.form.errGeneric
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setVatNumber("");
    setVatValid(false);
    setVatError(null);
    setAttachedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setForm({
      fullName: "", companyName: "", email: "", phone: "",
      country: "", businessType: "",
      tyreCategory: "", brandPreference: "", tyreSize: "",
      quantity: "", budgetRange: "",
      deliveryAddress: "", deliveryCity: "", deliveryPostalCode: "",
      deliveryLocation: "", deliveryTimeline: "", notes: "",
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
          {t.quote.form.successTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-7 text-[var(--muted)]">
          {t.quote.form.successBody}
        </p>
        <div className="mt-6 rounded-[14px] bg-white px-6 py-4">
          <p className="text-[0.78rem] text-[var(--muted)]">{t.quote.form.refLabel}</p>
          <p className="mt-0.5 text-[1.2rem] font-extrabold tracking-wider text-[var(--foreground)]">
            {refNumber}
          </p>
        </div>
        <p className="mt-4 text-[0.82rem] text-[var(--muted)]">
          {t.quote.form.refNote}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-8 rounded-full bg-[var(--primary)] px-8 py-3 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          {t.quote.form.successButton}
        </button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-[22px] bg-[#efefef] p-7 md:p-10">
      <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
        {t.quote.form.eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
        {t.quote.form.heading}
      </h2>
      <p className="mt-1.5 text-[0.88rem] text-[var(--muted)]">
        {t.quote.form.requiredNote}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* ── Business Information ── */}
          <SectionLabel>{t.quote.form.sectionBusiness}</SectionLabel>

          <Field label={t.quote.form.labelFullName} htmlFor="quote-fullName" required error={errors.fullName}>
            <div id="field-fullName">
              <input
                id="quote-fullName"
                type="text"
                placeholder={t.quote.form.placeholderFullName}
                value={form.fullName}
                onChange={set("fullName")}
                aria-describedby={errors.fullName ? "quote-fullName-error" : undefined}
                aria-invalid={!!errors.fullName}
                className={ic("fullName")}
              />
            </div>
          </Field>

          <Field label={t.quote.form.labelCompany} htmlFor="quote-companyName" error={errors.companyName}>
            <input
              id="quote-companyName"
              type="text"
              placeholder={t.quote.form.placeholderCompany}
              value={form.companyName}
              onChange={set("companyName")}
              className={ic("companyName")}
            />
          </Field>

          <Field label={t.quote.form.labelEmail} htmlFor="quote-email" required error={errors.email}>
            <div id="field-email">
              <input
                id="quote-email"
                type="email"
                placeholder={t.quote.form.placeholderEmail}
                value={form.email}
                onChange={set("email")}
                aria-describedby={errors.email ? "quote-email-error" : undefined}
                aria-invalid={!!errors.email}
                className={ic("email")}
              />
            </div>
          </Field>

          <Field label={t.quote.form.labelPhone} htmlFor="quote-phone" error={errors.phone}>
            <input
              id="quote-phone"
              type="tel"
              placeholder={t.quote.form.placeholderPhone}
              value={form.phone}
              onChange={set("phone")}
              className={ic("phone")}
            />
          </Field>

          <Field label={t.quote.form.labelCountry} htmlFor="quote-country" required error={errors.country}>
            <div id="field-country">
              <select id="quote-country" value={form.country} onChange={set("country")} aria-describedby={errors.country ? "quote-country-error" : undefined} aria-invalid={!!errors.country} className={ic("country")}>
                <option value="">{t.quote.form.placeholderCountry}</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Field>

          <Field label={t.quote.form.labelBusiness} htmlFor="quote-businessType" error={errors.businessType}>
            <select id="quote-businessType" value={form.businessType} onChange={set("businessType")} className={ic("businessType")}>
              <option value="">{t.quote.form.placeholderBusiness}</option>
              {t.quote.form.businessTypes.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>

          {showVatField && (
            <div className="col-span-full" id="field-vatNumber">
              <VatField
                value={vatNumber}
                onChange={setVatNumber}
                onValidationChange={(valid) => {
                  setVatValid(valid);
                  if (valid) setVatError(null);
                }}
              />
              {vatError && (
                <p role="alert" className="mt-1.5 text-[0.75rem] text-red-500">{vatError}</p>
              )}
            </div>
          )}

          {/* ── Product Request ── */}
          <SectionLabel>{t.quote.form.sectionProduct}</SectionLabel>

          <Field label={t.quote.form.labelTyreCategory} htmlFor="quote-tyreCategory" required error={errors.tyreCategory}>
            <div id="field-tyreCategory">
              <select id="quote-tyreCategory" value={form.tyreCategory} onChange={set("tyreCategory")} aria-describedby={errors.tyreCategory ? "quote-tyreCategory-error" : undefined} aria-invalid={!!errors.tyreCategory} className={ic("tyreCategory")}>
                <option value="">{t.quote.form.placeholderCategory}</option>
                {t.quote.form.tyreCategories.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </Field>

          <Field label={t.quote.form.labelBrand} htmlFor="quote-brandPreference" error={errors.brandPreference}>
            <input
              id="quote-brandPreference"
              type="text"
              placeholder={t.quote.form.placeholderBrand}
              value={form.brandPreference}
              onChange={set("brandPreference")}
              className={ic("brandPreference")}
            />
          </Field>

          <Field label={t.quote.form.labelTyreSize} htmlFor="quote-tyreSize" error={errors.tyreSize}>
            <input
              id="quote-tyreSize"
              type="text"
              placeholder={t.quote.form.placeholderSize}
              value={form.tyreSize}
              onChange={set("tyreSize")}
              className={ic("tyreSize")}
            />
          </Field>

          <Field label={t.quote.form.labelQuantity} htmlFor="quote-quantity" required error={errors.quantity}>
            <div id="field-quantity">
              <input
                id="quote-quantity"
                type="text"
                placeholder={t.quote.form.placeholderQuantity}
                value={form.quantity}
                onChange={set("quantity")}
                aria-describedby={errors.quantity ? "quote-quantity-error" : undefined}
                aria-invalid={!!errors.quantity}
                className={ic("quantity")}
              />
            </div>
          </Field>

          <Field label={t.quote.form.labelBudget} htmlFor="quote-budgetRange" error={errors.budgetRange}>
            <select id="quote-budgetRange" value={form.budgetRange} onChange={set("budgetRange")} className={ic("budgetRange")}>
              <option value="">{t.quote.form.placeholderBudget}</option>
              {t.quote.form.budgetRanges.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>

          <Field label={t.quote.form.labelTimeline} htmlFor="quote-deliveryTimeline" error={errors.deliveryTimeline}>
            <select id="quote-deliveryTimeline" value={form.deliveryTimeline} onChange={set("deliveryTimeline")} className={ic("deliveryTimeline")}>
              <option value="">{t.quote.form.placeholderTimeline}</option>
              {t.quote.form.timelines.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>

          {/* ── Delivery Details ── */}
          <SectionLabel>{t.quote.form.sectionDelivery}</SectionLabel>

          <div className="col-span-full">
            <Field label={t.quote.form.labelDeliveryAddress} htmlFor="quote-deliveryAddress">
              <input
                id="quote-deliveryAddress"
                type="text"
                placeholder={t.quote.form.placeholderDeliveryAddress}
                value={form.deliveryAddress}
                onChange={set("deliveryAddress")}
                className={ic("deliveryAddress")}
              />
            </Field>
          </div>

          <Field label={t.quote.form.labelDeliveryCity} htmlFor="quote-deliveryCity">
            <input
              id="quote-deliveryCity"
              type="text"
              placeholder={t.quote.form.placeholderDeliveryCity}
              value={form.deliveryCity}
              onChange={set("deliveryCity")}
              className={ic("deliveryCity")}
            />
          </Field>

          <Field label={t.quote.form.labelDeliveryPostalCode} htmlFor="quote-deliveryPostalCode">
            <input
              id="quote-deliveryPostalCode"
              type="text"
              placeholder={t.quote.form.placeholderDeliveryPostalCode}
              value={form.deliveryPostalCode}
              onChange={set("deliveryPostalCode")}
              className={ic("deliveryPostalCode")}
            />
          </Field>

          <div className="col-span-full">
            <div id="field-deliveryLocation">
              <Field label={t.quote.form.labelDelivery} htmlFor="quote-deliveryLocation" required error={errors.deliveryLocation}>
                <input
                  id="quote-deliveryLocation"
                  type="text"
                  placeholder={t.quote.form.placeholderDelivery}
                  value={form.deliveryLocation}
                  onChange={set("deliveryLocation")}
                  aria-describedby={errors.deliveryLocation ? "quote-deliveryLocation-error" : undefined}
                  aria-invalid={!!errors.deliveryLocation}
                  className={ic("deliveryLocation")}
                />
              </Field>
            </div>
          </div>

          <Field label={t.quote.form.labelNotes} htmlFor="quote-notes" required error={errors.notes}>
            <div id="field-notes" className="col-span-full">
              <textarea
                id="quote-notes"
                placeholder={t.quote.form.placeholderNotes}
                value={form.notes}
                onChange={set("notes")}
                rows={5}
                aria-describedby={errors.notes ? "quote-notes-error" : undefined}
                aria-invalid={!!errors.notes}
                className={`${ic("notes")} resize-none`}
              />
            </div>
          </Field>

          {/* ── File upload ── */}
          <div className="col-span-full">
            <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
              {t.quote.form.labelUpload}
              <span className="ml-1.5 text-[0.75rem] font-normal text-[var(--muted)]">
                PDF, CSV, XLS or XLSX · Max 10 MB
              </span>
            </label>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv,.xls,.xlsx"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Attach specification sheet"
            />

            {attachedFile ? (
              /* File selected — show name + size + remove */
              <div className="flex items-center justify-between rounded-[12px] border border-black/[0.10] bg-white px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <Paperclip size={15} strokeWidth={1.8} className="shrink-0 text-[var(--primary)]" />
                  <div className="min-w-0">
                    <p className="truncate text-[0.88rem] font-semibold text-[var(--foreground)]">
                      {attachedFile.name}
                    </p>
                    <p className="text-[0.75rem] text-[var(--muted)]">
                      {formatFileSize(attachedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/[0.08] text-[var(--muted)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove attached file"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              /* No file — click-to-browse area */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-[12px] border border-dashed border-black/[0.12] bg-white/60 px-4 py-4 text-left transition hover:border-[var(--primary)]/40 hover:bg-white"
              >
                <Paperclip size={16} strokeWidth={1.8} className="shrink-0 text-[var(--muted)]" />
                <span className="text-[0.88rem] text-[var(--muted)]">
                  {t.quote.form.uploadHint}
                </span>
              </button>
            )}

            {fileError && (
              <p role="alert" className="mt-1 text-[0.75rem] text-red-500">{fileError}</p>
            )}
          </div>

        </div>

        {/* Submit error */}
        {submitError && (
          <div className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
            {submitError}
          </div>
        )}

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
                {t.quote.form.submitting}
              </span>
            ) : (
              t.quote.form.submit
            )}
          </button>
          <p className="mt-3 text-center text-[0.78rem] text-[var(--muted)]">
            {t.quote.form.submitNote}
          </p>
        </div>
      </form>
    </div>
  );
}
