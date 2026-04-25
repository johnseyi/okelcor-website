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

/** PostHog — safe caller. No-ops on SSR or before posthog.init(). */
function phCapture(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    // Dynamic import so SSR bundling never pulls in posthog-js
    import("posthog-js").then(({ default: posthog }) => {
      if (posthog.__loaded) posthog.capture(event, props);
    });
  } catch {}
}

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
  if (GA_ID) gtag("event", name, params);
  phCapture(name, params);
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
  if (GA_ID) {
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
  phCapture("product_viewed", {
    product_id:   product.id,
    product_name: `${product.brand} ${product.name} ${product.size}`,
    brand:        product.brand,
    tyre_type:    product.type,
    size:         product.size,
    price:        product.price,
    currency:     "EUR",
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
  if (GA_ID) {
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
  phCapture("add_to_cart", {
    product_id:   product.id,
    product_name: `${product.brand} ${product.name} ${product.size}`,
    brand:        product.brand,
    tyre_type:    product.type,
    size:         product.size,
    price:        product.price,
    quantity,
    value:        product.price * quantity,
    currency:     "EUR",
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
  if (GA_ID) {
    gtag("event", "quote_request_submitted", {
      tyre_category: params.tyreCategory,
      country: params.country,
    });
  }
  phCapture("quote_requested", {
    tyre_category: params.tyreCategory,
    country:       params.country,
  });
}

/**
 * Custom event: contact_form_submitted
 * Fire on successful contact form submission.
 */
export function trackContactSubmit() {
  if (GA_ID) gtag("event", "contact_form_submitted");
  phCapture("contact_form_submitted");
}

/** PostHog-only: checkout_started — fire when order submission begins. */
export function trackCheckoutStarted(params: {
  value: number;
  itemCount: number;
  currency?: string;
}) {
  if (GA_ID) {
    gtag("event", "begin_checkout", {
      currency: params.currency ?? "EUR",
      value: params.value,
    });
  }
  phCapture("checkout_started", {
    value:      params.value,
    item_count: params.itemCount,
    currency:   params.currency ?? "EUR",
  });
}

/** PostHog-only: tyre_spec_selected — fire when user searches with a size. */
export function trackTyreSpecSelected(params: {
  width?: string;
  height?: string;
  rim?: string;
  size?: string;
  brand?: string;
  tyre_type?: string;
}) {
  phCapture("tyre_spec_selected", params);
}
