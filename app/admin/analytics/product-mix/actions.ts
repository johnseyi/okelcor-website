"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type ConditionRow = {
  condition: "new" | "used" | "unknown" | string;
  units: number;
  revenue: number;
  orders: number;
  est_margin: number | null;
  margin_units: number;
  channels: { website: number; ebay: number };
};

export type SizeRow = {
  condition: string;
  type: string;
  size: string;
  units: number;
  revenue: number;
  repeat_units: number;
  repeat_customers: number;
  countries: { country: string; units: number }[];
};

export type BundleRow = {
  condition: string;
  type: string;
  size: string;
  country: string;
  evidence: string;
  suggestion: string;
};

export type ProductMix = {
  by_condition: ConditionRow[];
  top_sizes: SizeRow[];
  bundles: BundleRow[];
};

export type ProductMixMeta = {
  window_days: number;
  unknown_lines: number;
  repeat_customer_count: number;
  satisfied_definition: string;
};

export async function getProductMix(days: number): Promise<{ data?: ProductMix; meta?: ProductMixMeta; error?: string }> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!token) return { error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/analytics/product-mix?days=${days}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.status === 403) return { error: "You do not have permission for this report." };
  if (!res.ok) return { error: (typeof json.message === "string" && json.message) || "Request failed." };

  return { data: json.data as ProductMix, meta: json.meta as ProductMixMeta };
}
