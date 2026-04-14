import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "./payment-config";

/**
 * Stripe.js singleton — loaded once and reused across the app.
 * Returns null if the publishable key is not set (Stripe disabled).
 */
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
