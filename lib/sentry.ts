/**
 * lib/sentry.ts
 *
 * Thin wrappers around Sentry.setUser() for consistent user tagging.
 *
 * Call these from auth contexts/providers so every error is tagged
 * with who was logged in when it happened.
 *
 * Usage:
 *   // In admin shell after profile loads:
 *   import { setSentryAdminUser, clearSentryUser } from "@/lib/sentry";
 *   setSentryAdminUser({ id: 1, name: "John", email: "john@...", role: "super_admin" });
 *
 *   // In CustomerAuthProvider after login:
 *   import { setSentryCustomer, clearSentryUser } from "@/lib/sentry";
 *   setSentryCustomer({ id: 42, email: "customer@..." });
 *
 *   // On logout:
 *   clearSentryUser();
 */

import * as Sentry from "@sentry/nextjs";

export function setSentryAdminUser(user: {
  id:    number;
  name:  string;
  email: string;
  role:  string;
}) {
  Sentry.setUser({
    id:       String(user.id),
    username: user.name,
    email:    user.email,
  });
  Sentry.setTag("admin_user", user.email);
  Sentry.setTag("admin_role", user.role);
  Sentry.setTag("panel",      "admin");
}

export function setSentryCustomer(customer: {
  id:    number;
  email: string;
}) {
  Sentry.setUser({
    id:    String(customer.id),
    email: customer.email,
  });
  Sentry.setTag("customer_id", String(customer.id));
}

export function clearSentryUser() {
  Sentry.setUser(null);
}

/** Manually capture an error with optional extra context — use in catch blocks. */
export function captureError(
  err: unknown,
  context?: Record<string, unknown>
) {
  Sentry.captureException(err, context ? { extra: context } : undefined);
}
