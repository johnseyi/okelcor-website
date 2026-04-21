import { createMollieClient } from "@mollie/api-client";

const apiKey = process.env.MOLLIE_API_KEY ?? "";

if (!apiKey && process.env.NODE_ENV === "production") {
  console.error("[Mollie] MOLLIE_API_KEY is not set.");
}

export const mollieClient = createMollieClient({ apiKey });

export function formatAmount(euros: number): string {
  return euros.toFixed(2);
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
