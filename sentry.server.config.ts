import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  // 100% of errors, 10% of performance traces in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  beforeSend(event) {
    const url = event.request?.url ?? "";
    if (url.includes("/api/admin/") || url.includes("/admin/")) {
      event.tags = { ...event.tags, panel: "admin" };
    }
    return event;
  },
});
