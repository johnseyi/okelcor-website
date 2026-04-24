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

function revalidateFet() {
  revalidatePath("/admin/fet");
  revalidatePath("/fet");
}

// ── Engine models ─────────────────────────────────────────────────────────────

export async function createEngineModel(data: {
  category: "cars_suv" | "commercial";
  manufacturer: string;
  model_series: string;
  engine_code?: string;
  displacement?: string;
  fuel_type: "diesel" | "petrol" | "both";
  fet_model: string;
  notes?: string;
}): Promise<{ error?: string; id?: number }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/fet/engines`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error." };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { error: json.message || `HTTP ${res.status}` };
  revalidateFet();
  return { id: json.data?.id };
}

export async function updateEngineModel(
  id: number,
  data: {
    category?: "cars_suv" | "commercial";
    manufacturer?: string;
    model_series?: string;
    engine_code?: string;
    displacement?: string;
    fuel_type?: "diesel" | "petrol" | "both";
    fet_model?: string;
    notes?: string;
  }
): Promise<{ error?: string }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/fet/engines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error." };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { error: json.message || `HTTP ${res.status}` };
  revalidateFet();
  return {};
}

export async function deleteEngineModel(id: number): Promise<{ error?: string }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/fet/engines/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { error: "Network error." };
  }
  if (!res.ok && res.status !== 204) {
    const json = await res.json().catch(() => ({}));
    return { error: json.message || `HTTP ${res.status}` };
  }
  revalidateFet();
  return {};
}

// ── Bulk import from PDF data ─────────────────────────────────────────────────

export async function importEngineModels(
  category: "cars_suv" | "commercial",
  rows: Array<{
    manufacturer: string;
    model_series: string;
    engine_code?: string;
    displacement?: string;
    fuel_type: "diesel" | "petrol" | "both";
    fet_model: string;
    notes?: string;
  }>
): Promise<{ error?: string; imported?: number }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/fet/engines/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ category, rows }),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error." };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { error: json.message || `HTTP ${res.status}` };
  revalidateFet();
  return { imported: json.data?.imported ?? rows.length };
}
