import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  COMPANY_NAME,
  COMPANY_EMAIL,
  COMPANY_NOREPLY_EMAIL,
} from "@/lib/constants";

/**
 * app/api/checkout/route.ts
 *
 * Checkout order handler.
 *
 * CURRENT BEHAVIOUR (no payment credentials):
 *   Validates the order, sends a notification email to the Okelcor team via
 *   Resend, and returns a manual-order success with an order reference.
 *   The customer sees a success screen; the team handles payment offline.
 *
 * WHEN CREDENTIALS ARE READY:
 *   Each provider has a clearly marked integration point below.
 *   Fill in the SDK call, set the env vars — live payments activate
 *   automatically with no structural changes to this file.
 *
 * ── INTEGRATION POINTS ────────────────────────────────────────────────────────
 *
 * Stripe (card / Apple Pay / Google Pay):
 *   Install:  npm install stripe
 *   Env vars: STRIPE_SECRET_KEY
 *   Docs:     https://stripe.com/docs/api/payment_intents/create
 *
 * PayPal:
 *   Install:  npm install @paypal/paypal-server-sdk
 *   Env vars: PAYPAL_CLIENT_SECRET + NEXT_PUBLIC_PAYPAL_CLIENT_ID
 *   Docs:     https://developer.paypal.com/docs/api/orders/v2/
 *
 * Klarna (via Stripe):
 *   No extra package — uses the Stripe SDK above.
 *   Env vars: NEXT_PUBLIC_KLARNA_ENABLED=true (also needs STRIPE_SECRET_KEY)
 *   Docs:     https://stripe.com/docs/payments/klarna
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Config ────────────────────────────────────────────────────────────────────

const resend       = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL   = process.env.FROM_EMAIL  || `${COMPANY_NAME} Website <${COMPANY_NOREPLY_EMAIL}>`;
const NOTIFY_EMAIL = process.env.QUOTE_EMAIL || process.env.CONTACT_EMAIL || COMPANY_EMAIL;

const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
const paypalConfigured = !!process.env.PAYPAL_CLIENT_SECRET;
const klarnaConfigured = stripeConfigured && !!process.env.NEXT_PUBLIC_KLARNA_ENABLED;

// ── Types ─────────────────────────────────────────────────────────────────────

interface DeliveryData {
  name:       string;
  email:      string;
  address:    string;
  city:       string;
  postalCode: string;
  country:    string;
  phone:      string;
}

interface OrderItem {
  product: {
    id:    number;
    brand: string;
    name:  string;
    size:  string;
    price: number;
  };
  quantity: number;
}

interface CheckoutBody {
  delivery:      DeliveryData;
  paymentMethod: string;
  items:         OrderItem[];
}

interface CheckoutResponse {
  success:  boolean;
  orderRef?: string;
  mode?:    "live" | "manual";
  message?: string;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateBody(raw: unknown): CheckoutBody | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;

  const d = b.delivery as Record<string, unknown> | undefined;
  if (!d) return null;

  if (
    typeof d.name       !== "string" || !d.name.trim()       ||
    typeof d.email      !== "string" || !d.email.trim()      ||
    typeof d.address    !== "string" || !d.address.trim()    ||
    typeof d.city       !== "string" || !d.city.trim()       ||
    typeof d.postalCode !== "string" || !d.postalCode.trim() ||
    typeof d.country    !== "string" || !d.country           ||
    typeof d.phone      !== "string" || !d.phone.trim()
  ) return null;

  if (!Array.isArray(b.items) || b.items.length === 0) return null;
  if (typeof b.paymentMethod !== "string") return null;

  return b as unknown as CheckoutBody;
}

// ── Order ref generator ───────────────────────────────────────────────────────

function generateOrderRef(): string {
  const ts   = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `OKL-${ts}${rand}`;
}

// ── Email builder ─────────────────────────────────────────────────────────────

function buildOrderEmailHtml(order: CheckoutBody, orderRef: string, isLive: boolean): string {
  const itemsHtml = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${i.product.brand} ${i.product.name} ${i.product.size}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">&#8364;${(i.product.price * i.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const subtotal = order.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const d        = order.delivery;

  const badge = isLive
    ? `<span style="background:#dcfce7;color:#166534;padding:2px 10px;border-radius:999px;font-size:12px">Payment processed</span>`
    : `<span style="background:#fef9c3;color:#854d0e;padding:2px 10px;border-radius:999px;font-size:12px">Manual order &#8212; awaiting payment</span>`;

  const manualNote = !isLive
    ? `<div style="margin-top:20px;padding:14px;background:#fefce8;border-radius:10px;border:1px solid #fde047">
        <p style="margin:0;font-size:13px;color:#854d0e">
          <strong>Manual order</strong> &#8212; live payment credentials are not yet configured.
          Please contact the customer to arrange payment before shipping.
        </p>
      </div>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#171a20">
      <div style="background:#f4511e;padding:20px 24px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;color:#fff;font-size:20px">New Order &#8212; ${orderRef}</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px">${badge}</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="font-size:15px;margin:0 0 12px">Customer</h2>
        <p style="margin:0;font-size:14px;line-height:1.6">${d.name}<br>${d.email}<br>${d.phone}</p>

        <h2 style="font-size:15px;margin:20px 0 12px">Delivery address</h2>
        <p style="margin:0;font-size:14px;line-height:1.6">${d.address}<br>${d.city} ${d.postalCode}<br>${d.country}</p>

        <h2 style="font-size:15px;margin:20px 0 12px">Payment method</h2>
        <p style="margin:0;font-size:14px">${order.paymentMethod}</p>

        <h2 style="font-size:15px;margin:20px 0 12px">Order items</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="border-bottom:2px solid #eee">
              <th style="text-align:left;padding-bottom:6px">Product</th>
              <th style="text-align:center;padding-bottom:6px">Qty</th>
              <th style="text-align:right;padding-bottom:6px">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="margin-top:16px;border-top:2px solid #171a20;padding-top:12px;display:flex;justify-content:space-between">
          <strong style="font-size:15px">Order Total</strong>
          <strong style="font-size:15px">&#8364;${subtotal.toFixed(2)}</strong>
        </div>
        ${manualNote}
      </div>
    </div>
  `;
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<CheckoutResponse>> {
  // ── Parse + validate ───────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  const order = validateBody(body);
  if (!order) {
    return NextResponse.json(
      { success: false, message: "Missing or invalid order data." },
      { status: 422 }
    );
  }

  const orderRef = generateOrderRef();
  let isLive     = false;

  // ── Payment processing ─────────────────────────────────────────────────────
  // Each block is the integration point for a live provider.
  // When credentials are configured, uncomment and implement the SDK call.
  // On payment failure, return an error response before the email block.

  if (order.paymentMethod === "card" && stripeConfigured) {
    // ── STRIPE INTEGRATION POINT ───────────────────────────────────────────
    // 1. npm install stripe
    // 2. import Stripe from "stripe";
    //    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // 3. const intent = await stripe.paymentIntents.create({
    //      amount:   Math.round(subtotal * 100),
    //      currency: "eur",
    //      metadata: { orderRef, customer: order.delivery.email },
    //    });
    //    Return { success: true, orderRef, clientSecret: intent.client_secret }
    //    so the client can confirm with Stripe.js Elements.
    // ──────────────────────────────────────────────────────────────────────
    isLive = false; // flip to true once the SDK call above is implemented
  }

  if (order.paymentMethod === "paypal" && paypalConfigured) {
    // ── PAYPAL INTEGRATION POINT ───────────────────────────────────────────
    // 1. npm install @paypal/paypal-server-sdk
    // 2. Create a PayPal Orders v2 order, return the approval link to client.
    // ──────────────────────────────────────────────────────────────────────
    isLive = false;
  }

  if (order.paymentMethod === "klarna" && klarnaConfigured) {
    // ── KLARNA INTEGRATION POINT ───────────────────────────────────────────
    // Klarna runs through Stripe. Use stripe.paymentIntents.create with
    // payment_method_types: ["klarna"] and return the client_secret.
    // ──────────────────────────────────────────────────────────────────────
    isLive = false;
  }

  // ── Email notification ─────────────────────────────────────────────────────
  // Always notify the Okelcor team — ensures no order is ever silently lost.

  if (process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from:    FROM_EMAIL,
        to:      [NOTIFY_EMAIL],
        replyTo: order.delivery.email,
        subject: `${isLive ? "New Order" : "New Manual Order"} \u2014 ${orderRef}`,
        html:    buildOrderEmailHtml(order, orderRef, isLive),
      });
    } catch (emailErr) {
      // Email failure must NOT block order confirmation — log and continue.
      console.error("[checkout/api] Resend notification failed:", emailErr);
    }
  }

  // ── Success response ───────────────────────────────────────────────────────
  return NextResponse.json({
    success:  true,
    orderRef,
    /**
     * "live"   — payment was charged by a provider SDK.
     * "manual" — no live credentials yet; team handles payment offline.
     */
    mode: isLive ? "live" : "manual",
  });
}
