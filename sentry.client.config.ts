import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  // 100% of errors, 10% of performance traces in production
  tracesSampleRate:        process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Capture replays for 10% of sessions, 100% when an error occurs
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],

  beforeSend(event) {
    // Tag all admin panel events so they can be filtered in Sentry
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      event.tags = { ...event.tags, panel: "admin" };
    }
    return event;
  },
});
