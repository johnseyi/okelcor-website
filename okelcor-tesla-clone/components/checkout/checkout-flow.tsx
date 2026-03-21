"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useCart } from "@/context/cart-context";
import ExpressCheckout from "./express-checkout";
import PaymentSelector, {
  type PaymentMethod,
  type CardData,
} from "./payment-selector";
import OrderSummary from "./order-summary";

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
type CardErrors = Partial<CardData>;

// ─── Constants ────────────────────────────────────────────────────────────────

const DELIVERY_COST = 0; // free

const COUNTRIES = [
  "Germany", "United Kingdom", "Netherlands", "Belgium", "France",
  "Italy", "Spain", "Sweden", "Poland", "Austria", "Switzerland",
  "United States", "Canada", "United Arab Emirates", "Saudi Arabia",
  "Nigeria", "South Africa", "Kenya", "Uganda", "Singapore",
  "China", "India", "Japan", "Australia",
];

const inputCls =
  "w-full rounded-[12px] border border-black/[0.08] bg-white px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10";

const inputErrCls =
  "w-full rounded-[12px] border border-red-400 bg-red-50/50 px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-red-500";

// ─── Small helpers ────────────────────────────────────────────────────────────

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
      {error && (
        <p className="mt-0.5 text-[0.75rem] text-red-500">{error}</p>
      )}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] bg-[#efefef] p-6">
      <p className="mb-4 text-[1rem] font-extrabold text-[var(--foreground)]">
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState({ orderRef }: { orderRef: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-[480px] rounded-[22px] bg-[#efefef] p-10 text-center">
        <div className="flex justify-center">
          <CheckCircle2
            size={56}
            strokeWidth={1.5}
            className="text-green-500"
          />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
          Order Request Submitted
        </h2>
        <p className="mt-2 text-[0.95rem] leading-7 text-[var(--muted)]">
          Our team will contact you within 24 hours to confirm pricing,
          availability, and arrange delivery.
        </p>
        <div className="mt-5 rounded-[14px] bg-white py-3 px-5">
          <p className="text-[0.8rem] text-[var(--muted)]">Order reference</p>
          <p className="mt-0.5 text-[1.15rem] font-extrabold tracking-wider text-[var(--foreground)]">
            {orderRef}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/shop"
            className="flex h-[46px] flex-1 items-center justify-center rounded-full bg-[var(--primary)] text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex h-[46px] flex-1 items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f5f5f5]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Empty cart state ─────────────────────────────────────────────────────────

function EmptyCartState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16 text-center">
      <div>
        <p className="text-2xl font-extrabold text-[var(--foreground)]">
          Your cart is empty
        </p>
        <p className="mt-2 text-[0.95rem] text-[var(--muted)]">
          Add some tyres before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex h-[46px] items-center gap-2 rounded-full bg-[var(--primary)] px-6 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          Browse Catalogue <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// ─── Main checkout flow ───────────────────────────────────────────────────────

export default function CheckoutFlow() {
  const { items, clearCart } = useCart();
  const deliveryRef = useRef<HTMLDivElement>(null);

  const [delivery, setDelivery] = useState<DeliveryData>({
    name: "", email: "", address: "",
    city: "", postalCode: "", country: "", phone: "",
  });
  const [deliveryErrors, setDeliveryErrors] = useState<DeliveryErrors>({});

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardData, setCardData] = useState<CardData>({
    number: "", expiry: "", cvv: "", holder: "",
  });
  const [cardErrors, setCardErrors] = useState<CardErrors>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  if (items.length === 0 && !submitted) return <EmptyCartState />;
  if (submitted) return <SuccessState orderRef={orderRef} />;

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateDelivery = (): boolean => {
    const errs: DeliveryErrors = {};
    if (!delivery.name.trim()) errs.name = "Name is required";
    if (!delivery.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email))
      errs.email = "Enter a valid email address";
    if (!delivery.address.trim()) errs.address = "Address is required";
    if (!delivery.city.trim()) errs.city = "City is required";
    if (!delivery.postalCode.trim()) errs.postalCode = "Postal code is required";
    if (!delivery.country) errs.country = "Select a country";
    if (!delivery.phone.trim()) errs.phone = "Phone number is required";
    setDeliveryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateCard = (): boolean => {
    if (paymentMethod !== "card") return true;
    const errs: CardErrors = {};
    const rawNumber = cardData.number.replace(/\s/g, "");
    if (rawNumber.length < 13) errs.number = "Enter a valid card number";
    if (!cardData.expiry || cardData.expiry.length < 5) errs.expiry = "Enter MM/YY";
    if (!cardData.cvv || cardData.cvv.length < 3) errs.cvv = "Enter CVV";
    if (!cardData.holder.trim()) errs.holder = "Cardholder name is required";
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    const deliveryOk = validateDelivery();
    const cardOk = validateCard();
    if (!deliveryOk || !cardOk) {
      deliveryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const ref = `OKL-${Date.now().toString().slice(-6)}`;
      clearCart();
      setOrderRef(ref);
      setSubmitted(true);
      setSubmitting(false);
    }, 1600);
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

  const ic = (key: keyof DeliveryData) =>
    deliveryErrors[key] ? inputErrCls : inputCls;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="tesla-shell py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)]">
        <Link href="/" className="transition hover:text-[var(--foreground)]">Home</Link>
        <ChevronRight size={13} className="opacity-50" />
        <Link href="/shop" className="transition hover:text-[var(--foreground)]">Shop</Link>
        <ChevronRight size={13} className="opacity-50" />
        <span className="font-medium text-[var(--foreground)]">Checkout</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start xl:grid-cols-[1fr_440px]">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">

          {/* Express checkout */}
          <ExpressCheckout onSelect={handleExpressSelect} />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-black/[0.08]" />
            <span className="text-[0.8rem] text-[var(--muted)]">or continue with</span>
            <div className="h-px flex-1 bg-black/[0.08]" />
          </div>

          {/* Delivery details */}
          <div ref={deliveryRef}>
            <SectionCard title="Delivery Details">
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" error={deliveryErrors.name}>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={delivery.name}
                      onChange={set("name")}
                      className={ic("name")}
                    />
                  </Field>
                  <Field label="Email Address" error={deliveryErrors.email}>
                    <input
                      type="email"
                      placeholder="john@company.com"
                      value={delivery.email}
                      onChange={set("email")}
                      className={ic("email")}
                    />
                  </Field>
                </div>

                <Field label="Street Address" error={deliveryErrors.address}>
                  <input
                    type="text"
                    placeholder="123 Warehouse Road"
                    value={delivery.address}
                    onChange={set("address")}
                    className={ic("address")}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City" error={deliveryErrors.city}>
                    <input
                      type="text"
                      placeholder="Munich"
                      value={delivery.city}
                      onChange={set("city")}
                      className={ic("city")}
                    />
                  </Field>
                  <Field label="Postal Code" error={deliveryErrors.postalCode}>
                    <input
                      type="text"
                      placeholder="80331"
                      value={delivery.postalCode}
                      onChange={set("postalCode")}
                      className={ic("postalCode")}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Country" error={deliveryErrors.country}>
                    <select
                      value={delivery.country}
                      onChange={set("country")}
                      className={ic("country")}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Phone Number" error={deliveryErrors.phone}>
                    <input
                      type="tel"
                      placeholder="+49 89 545583 60"
                      value={delivery.phone}
                      onChange={set("phone")}
                      className={ic("phone")}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Delivery method */}
          <SectionCard title="Delivery Method">
            <div className="flex items-center justify-between rounded-[14px] border-2 border-[var(--primary)] bg-white p-4">
              <div>
                <p className="text-[0.9rem] font-semibold text-[var(--foreground)]">
                  Standard International Shipping
                </p>
                <p className="mt-0.5 text-[0.82rem] text-[var(--muted)]">
                  5–10 business days · Tracked delivery
                </p>
              </div>
              <p className="text-[0.95rem] font-extrabold text-[var(--primary)]">
                Free
              </p>
            </div>
          </SectionCard>

          {/* Payment method */}
          <PaymentSelector
            method={paymentMethod}
            onChange={(m) => {
              setPaymentMethod(m);
              setCardErrors({});
            }}
            cardData={cardData}
            onCardChange={setCardData}
            cardErrors={cardErrors}
          />

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
                Processing…
              </span>
            ) : (
              "Place Order"
            )}
          </button>

          <p className="text-center text-[0.78rem] text-[var(--muted)]">
            By placing your order you agree to our{" "}
            <Link href="/contact" className="underline hover:text-[var(--foreground)]">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/contact" className="underline hover:text-[var(--foreground)]">
              Return Policy
            </Link>
            .
          </p>
        </div>

        {/* ── Right column: order summary (sticky) ── */}
        <div className="lg:sticky lg:top-[96px]">
          <OrderSummary deliveryCost={DELIVERY_COST} />
        </div>

      </div>
    </div>
  );
}
