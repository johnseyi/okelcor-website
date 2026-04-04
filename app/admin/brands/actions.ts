"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");
  return token;
}

function revalidateBrands() {
  revalidatePath("/admin/brands");
  revalidatePath("/", "page"); // homepage shows brands section
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createBrand(
  name: string
): Promise<{ error?: string; id?: number }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: json.message || `Failed to create brand (HTTP ${res.status}).` };
  }

  revalidateBrands();
  return { id: json.data?.id };
}

// ── Update name ────────────────────────────────────────────────────────────────

export async function updateBrand(
  id: number,
  name: string
): Promise<{ error?: string }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/brands/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: json.message || `Failed to update brand (HTTP ${res.status}).` };
  }

  revalidateBrands();
  return {};
}

// ── Upload logo ────────────────────────────────────────────────────────────────

export async function uploadBrandLogo(
  id: number,
  formData: FormData
): Promise<{ error?: string }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/brands/${id}/logo`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not upload logo." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: json.message || "Failed to upload logo." };
  }

  revalidateBrands();
  return {};
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export async function deleteBrand(
  id: number
): Promise<{ error?: string }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/brands/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  if (!res.ok && res.status !== 204) {
    const json = await res.json().catch(() => ({}));
    return { error: json.message || `Failed to delete brand (HTTP ${res.status}).` };
  }

  revalidateBrands();
  return {};
}
