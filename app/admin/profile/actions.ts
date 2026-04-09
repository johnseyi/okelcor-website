"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("admin_token")?.value ?? null;
}

export async function updateProfile(
  name: string,
  email: string
): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email }),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 403) return { error: "You don't have permission to update this profile." };
  if (!res.ok) return { error: json.message || "Failed to update profile." };

  // Refresh the admin_name cookie so the shell avatar updates on next load
  const cookieStore = await cookies();
  cookieStore.set("admin_name", name, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  revalidatePath("/admin/profile");
  return {};
}

export async function changePassword(
  current_password: string,
  password: string,
  password_confirmation: string
): Promise<{ error?: string; fieldError?: string }> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password, password, password_confirmation }),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 422) {
    const msg =
      json.errors?.current_password?.[0] ??
      json.message ??
      "Current password is incorrect.";
    return { fieldError: msg };
  }

  if (res.status === 403) return { error: "You don't have permission to perform this action." };
  if (!res.ok) return { error: json.message || "Failed to change password." };

  return {};
}
