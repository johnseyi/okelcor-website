"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * Authenticates an admin user against POST /api/v1/admin/login.
 *
 * On success: sets httpOnly admin_token cookie and redirects to /admin.
 * On failure: returns { error: string } so the login page can display it.
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<{ error: string } | void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server. Please try again." };
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      error:
        json.message ||
        (res.status === 422 ? "Invalid credentials. Please try again." : "Login failed."),
    };
  }

  const token: string | undefined = json.data?.token;
  if (!token) {
    return { error: "Authentication failed. No token received." };
  }

  const cookieStore = await cookies();

  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  // Store display name for the top bar (non-httpOnly so JS can read it if needed)
  const adminName: string | undefined = json.data?.admin?.name;
  if (adminName) {
    cookieStore.set("admin_name", adminName, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  // Store role for nav filtering and middleware route guards (non-httpOnly)
  const adminRole: string | undefined = json.data?.admin?.role;
  if (adminRole) {
    cookieStore.set("admin_role", adminRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  redirect("/admin");
}

// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * Deletes admin session cookies and redirects to /admin/login.
 * Used as a <form> action in the AdminShell sidebar.
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  cookieStore.delete("admin_name");
  cookieStore.delete("admin_role");
  redirect("/admin/login");
}
