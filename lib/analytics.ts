/**
 * lib/analytics.ts
 *
 * Typed wrapper around the GA4 gtag API.
 *
 * All functions are safe to call before GA4 loads or without a GA ID —
 * they check window.gtag and no-op silently when unavailable.
 *
 * The gtag script itself is injected by components/analytics-script.tsx
 * only after the user grants cookie consent.
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

/** Internal safe caller — never throws, never runs server-side. */
function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

/** Generic custom event. Use for one-off events not covered by the helpers below. */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>,
) {
  if (!GA_ID) return;
  gtag("event", name, params);
}

/**
 * GA4 ecommerce: view_item
 * Fire when a product detail page becomes visible.
 */
export function trackProductView(product: {
  id: number;
  brand: string;
  name: string;
  size: string;
  price: number;
  type: string;
}) {
  if (!GA_ID) return;
  gtag("event", "view_item", {
    currency: "EUR",
    value: product.price,
    items: [
      {
        item_id: String(product.id),
        item_name: `${product.brand} ${product.name} ${product.size}`,
        item_brand: product.brand,
        item_category: product.type,
        price: product.price,
        quantity: 1,
      },
    ],
  });
}

/**
 * GA4 ecommerce: add_to_cart
 * Fire when a user adds a product to their cart.
 */
export function trackAddToCart(
  product: {
    id: number;
    brand: string;
    name: string;
    size: string;
    price: number;
    type: string;
  },
  quantity: number,
) {
  if (!GA_ID) return;
  gtag("event", "add_to_cart", {
    currency: "EUR",
    value: product.price * quantity,
    items: [
      {
        item_id: String(product.id),
        item_name: `${product.brand} ${product.name} ${product.size}`,
        item_brand: product.brand,
        item_category: product.type,
        price: product.price,
        quantity,
      },
    ],
  });
}

/**
 * Custom event: quote_request_submitted
 * Fire on successful quote form submission.
 */
export function trackQuoteSubmit(params: {
  tyreCategory: string;
  country: string;
}) {
  if (!GA_ID) return;
  gtag("event", "quote_request_submitted", {
    tyre_category: params.tyreCategory,
    country: params.country,
  });
}

/**
 * Custom event: contact_form_submitted
 * Fire on successful contact form submission.
 */
export function trackContactSubmit() {
  if (!GA_ID) return;
  gtag("event", "contact_form_submitted");
}
