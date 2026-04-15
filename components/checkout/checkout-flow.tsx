"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import { stripePromise } from "@/lib/stripe-client";
import ExpressCheckout from "./express-checkout";
import PaymentSelector, { type PaymentMethod } from "./payment-selector";
import OrderSummary from "./order-summary";
import VatField from "@/components/vat-field";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryData = {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

type DeliveryErrors = Partial<DeliveryData>;

// ─── Constants ────────────────────────────────────────────────────────────────

const DELIVERY_COST = 0;

const COUNTRIES = [
  "Germany", "United Kingdom", "Netherlands", "Belgium", "France",
  "Italy", "Spain", "Sweden", "Poland", "Austria", "Switzerland",
  "United States", "Canada", "United Arab Emirates", "Saudi Arabia",
  "Nigeria", "South Africa", "Kenya", "Uganda", "Singapore",
  "China", "India", "Japan", "Australia",
];

const inputCls =
  "w-full rounded-[12px] border border-black/[0.08] bg-white px-4 py-3.5 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10";

const inputErrCls =
  "w-full rounded-[12px] border border-red-400 bg-red-50/50 px-4 py-3.5 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-red-500";

// ─── FET upsell ───────────────────────────────────────────────────────────────

const FET_PRODUCT = {
  product_name: "FET Engine Treatment",
  sku:          "FET-001",
  unit_price:   249.00,
} as const;

function FetUpsellCard({
  added,
  qty,
  onAdd,
  onChangeQty,
  onRemove,
  onDismiss,
}: {
  added:        boolean;
  qty:          number;
  onAdd:        () => void;
  onChangeQty:  (q: number) => void;
  onRemove:     () => void;
  onDismiss:    () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[#d1fae5] bg-[#f0fdf4]">
      {/* Green left accent bar */}
      <div className="absolute inset-y-0 left-0 w-1 bg-[#10b981]" aria-hidden="true" />

      <div className="px-5 py-5 pl-7 sm:px-6 sm:pl-8">
        {/* Top row: copy + price */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#166534]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" aria-hidden="true" />
              Add-on
            </span>
            <h3 className="text-[1rem] font-extrabold leading-snug text-[#111111]">
              Add FET Engine Treatment to your order?
            </h3>
            <p className="mt-1.5 max-w-[460px] text-[0.85rem] leading-6 text-[#6b7280]">
              Improve fuel efficiency by up to 15% and protect your engine. Trusted by fleet operators across Europe.
            </p>
          </div>

          <div className="shrink-0 sm:text-right">
            <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-[#9ca3af]">From</p>
            <p className="text-[1.4rem] font-extrabold leading-none text-[#10b981]">€249.00</p>
            <p className="mt-0.5 text-[0.72rem] text-[#9ca3af]">per unit</p>
          </div>
        </div>

        {/* Action row */}
        {!added ? (
          <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onAdd}
              className="flex h-[44px] w-full items-center justify-center rounded-full bg-[#10b981] px-6 text-[0.88rem] font-semibold text-white transition hover:bg-[#0d9e6e] sm:w-auto"
            >
              Add to Order
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="flex h-[44px] w-full items-center justify-center rounded-full px-4 text-[0.88rem] font-semibold text-[#6b7280] transition hover:text-[#111111] sm:w-auto"
            >
              No thanks
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1.5">
              <CheckCircle2 size={14} className="shrink-0 text-[#22c55e]" />
              <span className="text-[0.82rem] font-semibold text-[#166534]">Added to order</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[0.82rem] font-semibold text-[#6b7280]" htmlFor="fet-qty">
                Qty:
              </label>
              <select
                id="fet-qty"
                value={qty}
                onChange={(e) => onChangeQty(Number(e.target.value))}
                className="rounded-[8px] border border-[#d1fae5] bg-white px-3 py-1.5 text-[0.88rem] font-semibold text-[#111111] outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="text-[0.82rem] font-semibold text-[#9ca3af] underline transition hover:text-[#111111]"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

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
      {error && (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="mt-0.5 text-[0.75rem] text-red-500">{error}</p>
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] bg-[#efefef] p-6">
      <p className="mb-4 text-[1rem] font-extrabold text-[var(--foreground)]">{title}</p>
      {children}
    </div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState({ orderRef, mode }: { orderRef: string; mode: "live" | "manual" }) {
  const { t } = useLanguage();
  const c = t.checkout;
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-[480px] rounded-[22px] bg-[#efefef] p-10 text-center">
        <div className="flex justify-center">
          <CheckCircle2 size={56} strokeWidth={1.5} className="text-green-500" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
          {c.successTitle}
        </h2>
        <p className="mt-2 text-[0.95rem] leading-7 text-[var(--muted)]">
          {mode === "manual"
            ? "Your order has been received. Our team will review it and contact you to arrange payment before dispatch."
            : c.successBody}
        </p>
        {mode === "manual" && (
          <div className="mt-4 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-left">
            <p className="text-[0.78rem] leading-5 text-amber-700">
              <strong className="text-amber-800">What happens next:</strong>{" "}
              You will receive a confirmation email. A member of our team will reach out within 1 business day to confirm your order and arrange payment.
            </p>
          </div>
        )}
        <div className="mt-5 rounded-[14px] bg-white py-3 px-5">
          <p className="text-[0.8rem] text-[var(--muted)]">{c.orderRef}</p>
          <p className="mt-0.5 text-[1.15rem] font-extrabold tracking-wider text-[var(--foreground)]">
            {orderRef}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/shop"
            className="flex h-[46px] flex-1 items-center justify-center rounded-full bg-[var(--primary)] text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            {c.continueShopping}
          </Link>
          <Link
            href="/"
            className="flex h-[46px] flex-1 items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f5f5f5]"
          >
            {c.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Empty cart state ─────────────────────────────────────────────────────────

function EmptyCartState() {
  const { t } = useLanguage();
  const c = t.checkout;
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16 text-center">
      <div>
        <p className="text-2xl font-extrabold text-[var(--foreground)]">{c.emptyTitle}</p>
        <p className="mt-2 text-[0.95rem] text-[var(--muted)]">{c.emptyBody}</p>
        <Link
          href="/shop"
          className="mt-5 inline-flex h-[46px] items-center gap-2 rounded-full bg-[var(--primary)] px-6 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          {c.browseCatalogue} <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// ─── Inner checkout (needs to be inside <Elements>) ───────────────────────────

function CheckoutInner() {
  const { items, clearCart } = useCart();
  const { t } = useLanguage();
  const c = t.checkout;
  const stripe = useStripe();
  const elements = useElements();
  const deliveryRef = useRef<HTMLDivElement>(null);

  const [delivery, setDelivery] = useState<DeliveryData>({
    name: "", email: "", address: "",
    city: "", postalCode: "", country: "", phone: "",
  });
  const [deliveryErrors, setDeliveryErrors] = useState<DeliveryErrors>({});
  const [vatNumber, setVatNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [orderMode, setOrderMode] = useState<"live" | "manual">("manual");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // FET upsell state — dismissed once "No thanks" is clicked (session-scoped)
  const [fetAdded, setFetAdded]       = useState(false);
  const [fetQty, setFetQty]           = useState(1);
  const [fetDismissed, setFetDismissed] = useState(false);

  if (items.length === 0 && !submitted) return <EmptyCartState />;
  if (submitted) return <SuccessState orderRef={orderRef} mode={orderMode} />;

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateDelivery = (): boolean => {
    const errs: DeliveryErrors = {};
    if (!delivery.name.trim()) errs.name = c.errName;
    if (!delivery.email.trim()) errs.email = c.errEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email)) errs.email = c.errEmailInvalid;
    if (!delivery.address.trim()) errs.address = c.errAddress;
    if (!delivery.city.trim()) errs.city = c.errCity;
    if (!delivery.postalCode.trim()) errs.postalCode = c.errPostalCode;
    if (!delivery.country) errs.country = c.errCountry;
    if (!delivery.phone.trim()) errs.phone = c.errPhone;
    setDeliveryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Order payload (shared between Stripe and manual flows) ──────────────────

  const orderPayload = () => ({
    delivery,
    paymentMethod,
    vat_number: vatNumber.trim() || undefined,
    items: items.map((item) => ({
      product: {
        id:    item.product.id,
        brand: item.product.brand,
        name:  item.product.name,
        size:  item.product.size,
        price: item.product.price,
      },
      quantity: item.quantity,
    })),
    ...(fetAdded && {
      fet_addon: {
        product_name: FET_PRODUCT.product_name,
        sku:          FET_PRODUCT.sku,
        unit_price:   FET_PRODUCT.unit_price,
        quantity:     fetQty,
      },
    }),
  });

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateDelivery()) {
      deliveryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    // ── Stripe card payment ─────────────────────────────────────────────────
    if (paymentMethod === "card") {
      if (!stripe || !elements) {
        setSubmitError("Payment system not ready. Please refresh and try again.");
        setSubmitting(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setSubmitError("Card element not found. Please refresh and try again.");
        setSubmitting(false);
        return;
      }

      // Step 1 — create payment intent via Next.js API route (keeps secret key server-side)
      let clientSecret: string;
      try {
        const intentRes = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload()),
        });
        const intentData = await intentRes.json();

        if (!intentRes.ok || intentData.error) {
          setSubmitError(intentData.error ?? "Failed to initialise payment. Please try again.");
          setSubmitting(false);
          return;
        }

        clientSecret = intentData.client_secret;
      } catch {
        setSubmitError("Network error. Could not reach the payment service.");
        setSubmitting(false);
        return;
      }

      // Step 2 — confirm card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name:  delivery.name,
            email: delivery.email,
          },
        },
      });

      if (error) {
        // Stripe provides user-friendly messages (e.g. "Your card was declined.")
        setSubmitError(error.message ?? "Payment failed. Please try again.");
        setSubmitting(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        clearCart();
        setOrderRef(paymentIntent.id);
        setOrderMode("live");
        setSubmitted(true);
      } else {
        setSubmitError("Payment did not complete. Please try again.");
      }

      setSubmitting(false);
      return;
    }

    // ── Manual / non-card fallback (PayPal, Apple Pay, etc.) ───────────────
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload()),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      clearCart();
      setOrderRef(data.data?.ref ?? "");
      setOrderMode(data.data?.mode ?? "manual");
      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Express checkout shortcuts ──────────────────────────────────────────────

  const handleExpressSelect = (m: "applepay" | "paypal" | "googlepay") => {
    setPaymentMethod(m === "googlepay" ? "card" : m === "applepay" ? "applepay" : "paypal");
    deliveryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Field helpers ───────────────────────────────────────────────────────────

  const set = (key: keyof DeliveryData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDelivery((prev) => ({ ...prev, [key]: e.target.value }));
    setDeliveryErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const ic = (key: keyof DeliveryData) => deliveryErrors[key] ? inputErrCls : inputCls;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="tesla-shell py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)]">
        <Link href="/" className="transition hover:text-[var(--foreground)]">{c.breadcrumbHome}</Link>
        <ChevronRight size={13} className="opacity-50" />
        <Link href="/shop" className="transition hover:text-[var(--foreground)]">{c.breadcrumbShop}</Link>
        <ChevronRight size={13} className="opacity-50" />
        <span className="font-medium text-[var(--foreground)]">{c.breadcrumbCheckout}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start xl:grid-cols-[1fr_440px]">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">

          <ExpressCheckout onSelect={handleExpressSelect} />

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-black/[0.08]" />
            <span className="text-[0.8rem] text-[var(--muted)]">{c.orContinueWith}</span>
            <div className="h-px flex-1 bg-black/[0.08]" />
          </div>

          {/* Delivery details */}
          <div ref={deliveryRef}>
            <SectionCard title={c.sectionDelivery}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={c.labelName} htmlFor="checkout-name" error={deliveryErrors.name}>
                    <input id="checkout-name" type="text" placeholder={c.placeholderName} value={delivery.name} onChange={set("name")} aria-describedby={deliveryErrors.name ? "checkout-name-error" : undefined} aria-invalid={!!deliveryErrors.name} className={ic("name")} />
                  </Field>
                  <Field label={c.labelEmail} htmlFor="checkout-email" error={deliveryErrors.email}>
                    <input id="checkout-email" type="email" placeholder={c.placeholderEmail} value={delivery.email} onChange={set("email")} aria-describedby={deliveryErrors.email ? "checkout-email-error" : undefined} aria-invalid={!!deliveryErrors.email} className={ic("email")} />
                  </Field>
                </div>

                <Field label={c.labelAddress} htmlFor="checkout-address" error={deliveryErrors.address}>
                  <input id="checkout-address" type="text" placeholder={c.placeholderAddress} value={delivery.address} onChange={set("address")} aria-describedby={deliveryErrors.address ? "checkout-address-error" : undefined} aria-invalid={!!deliveryErrors.address} className={ic("address")} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={c.labelCity} htmlFor="checkout-city" error={deliveryErrors.city}>
                    <input id="checkout-city" type="text" placeholder={c.placeholderCity} value={delivery.city} onChange={set("city")} aria-describedby={deliveryErrors.city ? "checkout-city-error" : undefined} aria-invalid={!!deliveryErrors.city} className={ic("city")} />
                  </Field>
                  <Field label={c.labelPostalCode} htmlFor="checkout-postalCode" error={deliveryErrors.postalCode}>
                    <input id="checkout-postalCode" type="text" placeholder={c.placeholderPostalCode} value={delivery.postalCode} onChange={set("postalCode")} aria-describedby={deliveryErrors.postalCode ? "checkout-postalCode-error" : undefined} aria-invalid={!!deliveryErrors.postalCode} className={ic("postalCode")} />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={c.labelCountry} htmlFor="checkout-country" error={deliveryErrors.country}>
                    <select id="checkout-country" value={delivery.country} onChange={set("country")} aria-describedby={deliveryErrors.country ? "checkout-country-error" : undefined} aria-invalid={!!deliveryErrors.country} className={ic("country")}>
                      <option value="">{c.placeholderCountry}</option>
                      {COUNTRIES.map((ctry) => <option key={ctry} value={ctry}>{ctry}</option>)}
                    </select>
                  </Field>
                  <Field label={c.labelPhone} htmlFor="checkout-phone" error={deliveryErrors.phone}>
                    <input id="checkout-phone" type="tel" placeholder={c.placeholderPhone} value={delivery.phone} onChange={set("phone")} aria-describedby={deliveryErrors.phone ? "checkout-phone-error" : undefined} aria-invalid={!!deliveryErrors.phone} className={ic("phone")} />
                  </Field>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* VAT number */}
          <SectionCard title="Business Details">
            <VatField value={vatNumber} onChange={setVatNumber} />
          </SectionCard>

          {/* Delivery method */}
          <SectionCard title={c.sectionDeliveryMethod}>
            <div className="flex items-center justify-between rounded-[14px] border-2 border-[var(--primary)] bg-white p-4">
              <div>
                <p className="text-[0.9rem] font-semibold text-[var(--foreground)]">{c.shippingName}</p>
                <p className="mt-0.5 text-[0.82rem] text-[var(--muted)]">{c.shippingDetail}</p>
              </div>
              <p className="text-[0.95rem] font-extrabold text-[var(--primary)]">{c.shippingFree}</p>
            </div>
          </SectionCard>

          {/* FET upsell — shown between delivery method and payment */}
          {!fetDismissed && (
            <FetUpsellCard
              added={fetAdded}
              qty={fetQty}
              onAdd={() => setFetAdded(true)}
              onChangeQty={setFetQty}
              onRemove={() => setFetAdded(false)}
              onDismiss={() => { setFetDismissed(true); setFetAdded(false); }}
            />
          )}

          {/* Payment method — CardElement lives inside here */}
          <PaymentSelector
            method={paymentMethod}
            onChange={(m) => {
              setPaymentMethod(m);
              setSubmitError(null);
            }}
          />

          {/* Submit error */}
          {submitError && (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[0.83rem] font-semibold text-red-700">{submitError}</p>
            </div>
          )}

          {/* Place order */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex h-[54px] w-full items-center justify-center rounded-full bg-[var(--primary)] text-[1rem] font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {c.processing}
              </span>
            ) : (
              c.placeOrder
            )}
          </button>

          <p className="text-center text-[0.78rem] text-[var(--muted)]">
            {c.placeOrderNote}{" "}
            <Link href="/terms" className="underline hover:text-[var(--foreground)]">{c.termsLabel}</Link>{" "}
            {c.placeOrderNoteAnd}{" "}
            <Link href="/contact" className="underline hover:text-[var(--foreground)]">{c.returnPolicyLabel}</Link>.
          </p>
        </div>

        {/* ── Right column: order summary (sticky) ── */}
        <div className="lg:sticky lg:top-[96px]">
          <OrderSummary
            deliveryCost={DELIVERY_COST}
            fetAddon={fetAdded ? {
              name:      FET_PRODUCT.product_name,
              unitPrice: FET_PRODUCT.unit_price,
              qty:       fetQty,
            } : null}
          />
        </div>

      </div>
    </div>
  );
}

// ─── Outer wrapper — provides Stripe context ──────────────────────────────────

export default function CheckoutFlow() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  );
}
