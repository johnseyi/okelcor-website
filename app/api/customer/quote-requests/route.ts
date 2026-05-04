import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { COMPANY_NAME, COMPANY_EMAIL, COMPANY_NOREPLY_EMAIL } from "@/lib/constants";
import { getSiteSettings } from "@/lib/site-settings";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || `${COMPANY_NAME} Website <${COMPANY_NOREPLY_EMAIL}>`;

// ── Email helpers ─────────────────────────────────────────────────────────────

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function row(label: string, value: unknown): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8c8f94;white-space:nowrap;width:180px;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 16px;font-size:14px;color:#171a20;vertical-align:top;">${esc(value)}</td>
  </tr>`;
}

function section(title: string): string {
  return `<tr><td colspan="2" style="padding:18px 16px 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#f4511e;border-top:1px solid #f0f0f0;">${esc(title)}</td></tr>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildNotificationHtml(b: Record<string, any>, refNumber: string): string {
  const ts = new Date().toLocaleString("en-GB", { timeZone: "Europe/Berlin", dateStyle: "full", timeStyle: "short" });
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <tr><td style="background:#171a20;padding:32px 40px;">
    <div style="width:28px;height:4px;background:#f4511e;border-radius:2px;margin-bottom:16px;"></div>
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">New Quote Request</h1>
    <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.55);">
      Ref: <strong style="color:#f4511e;">${esc(refNumber)}</strong> &nbsp;·&nbsp; ${ts} CET
    </p>
  </td></tr>
  <tr><td style="padding:8px 24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${section("Customer")}
      ${row("Full Name", b.full_name)}
      ${row("Company", b.company_name)}
      ${row("Email", b.email)}
      ${row("Phone", b.phone)}
      ${row("Country", b.country)}
      ${row("Business Type", b.business_type)}
      ${section("Product Request")}
      ${row("Tyre Category", b.tyre_category)}
      ${row("Brand Preference", b.brand_preference)}
      ${row("Tyre Size / Spec", b.tyre_size)}
      ${row("Quantity", b.quantity)}
      ${row("Budget Range", b.budget_range)}
      ${section("Logistics")}
      ${row("Delivery Location", b.delivery_location)}
      ${row("Delivery Timeline", b.delivery_timeline)}
      ${section("Notes")}
      <tr><td colspan="2" style="padding:8px 16px;font-size:14px;color:#5c5e62;line-height:1.7;white-space:pre-wrap;">${esc(b.notes)}</td></tr>
      ${row("Attachment", b.attachment_name)}
    </table>
  </td></tr>
  <tr><td style="background:#f5f5f5;padding:16px 40px;border-top:1px solid #efefef;">
    <p style="margin:0;font-size:12px;color:#8c8f94;">
      Reply directly to this email to respond to <a href="mailto:${esc(b.email)}" style="color:#f4511e;">${esc(b.email)}</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const customerToken = request.cookies.get("customer_token")?.value;
  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any>;
  let backendBody: BodyInit;
  let backendContentType: string | null = null; // null → let fetch set boundary for multipart

  if (isMultipart) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ message: "Invalid form data." }, { status: 400 });
    }

    // Extract text fields + attachment filename for email notification
    body = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        body[key] = value;
      } else {
        // File entry — capture name for email row
        body["attachment_name"] = value.name;
      }
    }

    backendBody = formData; // fetch sets Content-Type + boundary automatically
  } else {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }
    backendBody = JSON.stringify(body);
    backendContentType = "application/json";
  }

  // ── 1. Save quote to backend ─────────────────────────────────────────────────

  let backendData: unknown;
  let backendStatus: number;

  try {
    const res = await fetch(`${API_URL}/quote-requests`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(backendContentType ? { "Content-Type": backendContentType } : {}),
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
      },
      body: backendBody,
    });

    backendData = await res.json();
    backendStatus = res.status;
  } catch {
    return NextResponse.json(
      { message: "Could not reach the quote service. Please try again." },
      { status: 502 }
    );
  }

  // ── 2. Send email notification on success ────────────────────────────────────

  if (backendStatus >= 200 && backendStatus < 300 && process.env.RESEND_API_KEY) {
    try {
      const settings = await getSiteSettings();
      const notifyEmail = (
        settings.quote_email ||
        settings.contact_email ||
        process.env.QUOTE_EMAIL ||
        process.env.CONTACT_EMAIL ||
        COMPANY_EMAIL
      ).replace(/@okelcor\.de\b/g, "@okelcor.com");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refNumber = (backendData as any)?.data?.ref_number ?? `OKL-QR-${Date.now().toString().slice(-6)}`;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: [notifyEmail],
        replyTo: body.email,
        subject: `Quote Request ${refNumber}: ${body.tyre_category ?? "Tyres"} — ${body.full_name ?? "Customer"}, ${body.country ?? ""}`,
        html: buildNotificationHtml(body, refNumber),
      });

      console.log(`[quote-requests] notification sent to ${notifyEmail} (ref: ${refNumber})`);
    } catch (emailErr) {
      // Email failure must never block the user — quote is already saved
      console.error("[quote-requests] email notification failed:", emailErr);
    }
  } else if (!process.env.RESEND_API_KEY) {
    console.warn("[quote-requests] RESEND_API_KEY not set — email notification skipped");
  }

  return NextResponse.json(backendData, { status: backendStatus });
}
