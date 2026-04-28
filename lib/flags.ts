/**
 * Feature flags — single source of truth for temporary behaviour toggles.
 *
 * SHOP_REQUIRES_LOGIN
 *   true  (default) — shop and product pages redirect unauthenticated users to /login
 *   false (temporary) — shop is publicly accessible, no login required
 *
 * Set to false temporarily for payment gateway registration reviews (Rapyd, Checkout.com).
 * Flip back to true once approved.
 */
export const SHOP_REQUIRES_LOGIN = false;
