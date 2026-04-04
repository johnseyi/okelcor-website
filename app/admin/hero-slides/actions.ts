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

function revalidateSlides() {
  revalidatePath("/admin/hero-slides");
  revalidatePath("/", "page");
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type SlideInput = {
  title: string;
  subtitle: string;
  order: number;
  cta_primary_label?: string;
  cta_primary_href?: string;
  cta_secondary_label?: string;
  cta_secondary_href?: string;
};

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createHeroSlide(
  input: SlideInput
): Promise<{ error?: string; id?: number }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/hero-slides`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: json.message || `Failed to create slide (HTTP ${res.status}).` };
  }

  revalidateSlides();
  return { id: json.data?.id };
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateHeroSlide(
  id: number,
  input: SlideInput
): Promise<{ error?: string }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/hero-slides/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: json.message || `Failed to update slide (HTTP ${res.status}).` };
  }

  revalidateSlides();
  return {};
}

// ── Upload media (image or video) ──────────────────────────────────────────────
// FormData must include: `media` (file) + `media_type` ("image" | "video")

export async function uploadHeroSlideMedia(
  id: number,
  formData: FormData
): Promise<{ error?: string }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/hero-slides/${id}/media`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not upload media." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: json.message || "Failed to upload media." };
  }

  revalidateSlides();
  return {};
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export async function deleteHeroSlide(
  id: number
): Promise<{ error?: string }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/hero-slides/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  if (!res.ok && res.status !== 204) {
    const json = await res.json().catch(() => ({}));
    return { error: json.message || `Failed to delete slide (HTTP ${res.status}).` };
  }

  revalidateSlides();
  return {};
}
