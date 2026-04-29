"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import {
  COMPANY_LEGAL_NAME,
  COMPANY_ADDRESS_STREET,
  COMPANY_ADDRESS_CITY,
  SITE_URL,
  COMPANY_EMAIL,
} from "@/lib/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const FROM_EMAIL = process.env.FROM_EMAIL || "Okelcor <noreply@okelcor.com>";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  order_manager: "Order Manager",
};

async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("admin_token")?.value ?? null;
}

// ── Admin welcome email ────────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildAdminWelcomeHtml(name: string, role: string): string {
  const safeName = esc(name || "there");
  const safeRole = esc(ROLE_LABELS[role] ?? role);
  const loginUrl = `${SITE_URL}/admin`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <tr>
    <td style="background:#171a20;padding:36px 40px 28px;">
      <div style="display:inline-block;width:36px;height:4px;background:#f4511e;border-radius:2px;margin-bottom:18px;"></div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;">Your admin account is ready</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.55);font-size:14px;">Okelcor Management Panel</p>
    </td>
  </tr>
  <tr>
    <td style="padding:36px 40px 28px;">
      <p style="margin:0 0 18px;font-size:16px;font-weight:600;color:#171a20;">Hi ${safeName},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#5c5e62;">
        An admin account has been created for you on the Okelcor management platform with the role:
      </p>
      <p style="margin:0 0 24px;">
        <span style="display:inline-block;background:#171a20;color:#ffffff;font-size:13px;font-weight:700;padding:6px 16px;border-radius:100px;letter-spacing:0.05em;">
          ${safeRole}
        </span>
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#5c5e62;">
        You should receive a separate email with your temporary login credentials shortly.
        If you do not receive it within a few minutes, please contact your administrator:
      </p>
      <p style="margin:0 0 24px;font-size:15px;">
        <a href="mailto:${esc(COMPANY_EMAIL)}" style="color:#f4511e;text-decoration:none;font-weight:600;">${esc(COMPANY_EMAIL)}</a>
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
        <tr>
          <td style="border:1px solid rgba(0,0,0,0.1);border-radius:100px;padding:0;">
            <a href="${loginUrl}" style="display:inline-block;padding:13px 32px;color:#171a20;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.01em;">
              Go to Admin Panel →
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:#f5f5f5;padding:20px 40px;border-top:1px solid #efefef;">
      <p style="margin:0;font-size:12px;color:#8c8f94;">
        ${esc(COMPANY_LEGAL_NAME)} &middot; ${esc(COMPANY_ADDRESS_STREET)} &middot; ${esc(COMPANY_ADDRESS_CITY)}
      </p>
      <p style="margin:6px 0 0;font-size:12px;color:#8c8f94;">
        You received this email because an admin account was created for you on okelcor.com.
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildAdminWelcomeText(name: string, role: string): string {
  return `Hi ${name || "there"},

An admin account has been created for you on the Okelcor management platform.

Role: ${ROLE_LABELS[role] ?? role}

You should receive a separate email with your temporary login credentials shortly.
If you do not receive it, please contact: ${COMPANY_EMAIL}

Admin Panel: ${SITE_URL}/admin

${COMPANY_LEGAL_NAME} · ${COMPANY_ADDRESS_STREET} · ${COMPANY_ADDRESS_CITY}
You received this email because an admin account was created for you on okelcor.com.
`;
}

async function sendAdminWelcomeEmail(
  email: string,
  name: string,
  role: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY || !email) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Your Okelcor admin account has been created",
      html: buildAdminWelcomeHtml(name, role),
      text: buildAdminWelcomeText(name, role),
    });
  } catch (err) {
    console.error("[admin-users] Resend welcome email failed:", err);
  }
}

// ── Server actions ────────────────────────────────────────────────────────────

export async function createUser(data: {
  name: string;
  email: string;
  role: string;
}): Promise<{ error?: string; id?: number; email_sent?: boolean }> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 403) return { error: "Only super admins can manage users." };

  // 5xx — user record was likely saved but email dispatch failed
  if (!res.ok) {
    if (res.status >= 500) {
      await sendAdminWelcomeEmail(data.email, data.name, data.role);
      revalidatePath("/admin/users");
      return { id: (json.data?.id as number | undefined), email_sent: false };
    }
    return { error: json.message || "Failed to create user." };
  }

  // 2xx — success; still send Resend notification since Laravel's mail is unreliable
  await sendAdminWelcomeEmail(data.email, data.name, data.role);
  revalidatePath("/admin/users");
  return {
    id: json.data?.id as number | undefined,
    email_sent: (json.email_sent as boolean | undefined) ?? true,
  };
}

export async function resendCredentials(id: number): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/users/${id}/resend-credentials`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 403) return { error: "Only super admins can manage users." };
  if (!res.ok) return { error: json.message || "Failed to resend credentials." };

  return {};
}

export async function updateUser(
  id: number,
  data: { name: string; email: string; role: string; password?: string }
): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  const payload: Record<string, string> = {
    name: data.name,
    email: data.email,
    role: data.role,
  };
  if (data.password?.trim()) payload.password = data.password;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 403) return { error: "Only super admins can manage users." };
  if (!res.ok) return { error: json.message || "Failed to update user." };

  revalidatePath("/admin/users");
  return {};
}

export async function deleteUser(id: number): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 403) return { error: "Only super admins can manage users." };
  if (!res.ok) return { error: json.message || "Failed to delete user." };

  revalidatePath("/admin/users");
  return {};
}
