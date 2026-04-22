import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { COMPANY_LEGAL_NAME, COMPANY_ADDRESS_STREET, COMPANY_ADDRESS_CITY } from "@/lib/constants";

const resend = new Resend(process.env.RESEND_API_KEY);
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const FROM_EMAIL = process.env.FROM_EMAIL || "Okelcor Website <noreply@okelcor.com>";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://okelcor.com";
const RESET_URL = `${SITE_URL}/forgot-password`;

const TEST_EMAIL = "johngraphics18@gmail.com";
const BATCH_SIZE = 100;

// ── Email template ─────────────────────────────────────────────────────────────

function buildMigrationHtml(firstName: string): string {
  const greeting = firstName ? `Hi ${escHtml(firstName)},` : "Hello,";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#171a20;padding:36px 40px 28px;">
            <div style="display:inline-block;width:36px;height:4px;background:#f4511e;border-radius:2px;margin-bottom:18px;"></div>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;">
              Okelcor has a new home
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.55);font-size:14px;">
              Your account is ready at <a href="${SITE_URL}" style="color:#f4511e;text-decoration:none;">okelcor.com</a>
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <p style="margin:0 0 18px;font-size:16px;color:#171a20;font-weight:600;">${greeting}</p>

            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#5c5e62;">
              We've launched our new platform at
              <a href="${SITE_URL}" style="color:#f4511e;text-decoration:none;font-weight:600;">okelcor.com</a>
              — a faster, more powerful experience for browsing our tyre catalogue, submitting quote requests, and managing your orders.
            </p>

            <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#5c5e62;">
              Your account has already been set up on the new platform.
              <strong style="color:#171a20;">No need to register again.</strong>
              Simply set a new password to access your account:
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#f4511e;border-radius:100px;padding:0;">
                  <a href="${RESET_URL}"
                     style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.01em;">
                    Set Your Password →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#8c8f94;">
              Or paste this link in your browser:<br />
              <a href="${RESET_URL}" style="color:#f4511e;text-decoration:none;word-break:break-all;">${RESET_URL}</a>
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 40px;">
            <hr style="border:none;border-top:1px solid #efefef;margin:0;" />
          </td>
        </tr>

        <!-- What's new section -->
        <tr>
          <td style="padding:28px 40px;">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#f4511e;">
              What's new
            </p>
            <table cellpadding="0" cellspacing="0" width="100%">
              ${[
                ["Full tyre catalogue", "Browse PCR, TBR, and used tyres with live stock availability."],
                ["Instant quote requests", "Submit detailed quotes and track their status from your account."],
                ["Order tracking", "Follow your shipments and view invoices in real time."],
              ].map(([title, desc]) => `
              <tr>
                <td style="padding:0 0 14px;">
                  <div style="display:flex;align-items:flex-start;gap:12px;">
                    <div style="flex-shrink:0;width:6px;height:6px;background:#f4511e;border-radius:50%;margin-top:6px;"></div>
                    <div>
                      <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#171a20;">${title}</p>
                      <p style="margin:0;font-size:13px;color:#5c5e62;">${desc}</p>
                    </div>
                  </div>
                </td>
              </tr>`).join("")}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:20px 40px;border-top:1px solid #efefef;">
            <p style="margin:0 0 4px;font-size:12px;color:#8c8f94;">
              ${COMPANY_LEGAL_NAME} · ${COMPANY_ADDRESS_STREET} · ${COMPANY_ADDRESS_CITY}
            </p>
            <p style="margin:0;font-size:12px;color:#8c8f94;">
              Questions? Reply to this email or contact
              <a href="mailto:support@okelcor.de" style="color:#f4511e;text-decoration:none;">support@okelcor.de</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 503 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const testMode = body.test_mode === true;

  // ── Test mode: single email to the test address ────────────────────────────
  if (testMode) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [TEST_EMAIL],
        subject: "Okelcor — Your account is ready at okelcor.com",
        html: buildMigrationHtml("Test User"),
      });
      return NextResponse.json({ sent: 1, total: 1, test_mode: true });
    } catch (err) {
      console.error("[migration-email] test send error:", err);
      return NextResponse.json({ error: "Failed to send test email." }, { status: 500 });
    }
  }

  // ── Full send: paginate all customers and batch-send ───────────────────────
  let page = 1;
  let sent = 0;
  let failed = 0;
  let total = 0;

  try {
    while (true) {
      const res = await fetch(
        `${API_URL}/admin/customers?per_page=${BATCH_SIZE}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: `API error ${res.status} fetching customers.` },
          { status: 502 }
        );
      }

      const json = await res.json();
      const customers: { first_name?: string; last_name?: string; email: string }[] =
        Array.isArray(json.data) ? json.data : [];

      if (page === 1) total = json.meta?.total ?? customers.length;
      if (customers.length === 0) break;

      const batch = customers.map((c) => ({
        from: FROM_EMAIL,
        to: [c.email],
        subject: "Okelcor — Your account is ready at okelcor.com",
        html: buildMigrationHtml(c.first_name || ""),
      }));

      try {
        await resend.batch.send(batch);
        sent += batch.length;
      } catch (batchErr) {
        console.error(`[migration-email] batch page ${page} error:`, batchErr);
        failed += batch.length;
      }

      if (customers.length < BATCH_SIZE) break;
      page++;
    }
  } catch (err) {
    console.error("[migration-email] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error during send." }, { status: 500 });
  }

  return NextResponse.json({ sent, failed, total, test_mode: false });
}
