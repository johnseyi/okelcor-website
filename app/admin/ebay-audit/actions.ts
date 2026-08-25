"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Types (mirror GET /admin/ebay/audit) ──────────────────────────────────────

export type AuditVerdict = "loss" | "thin" | "healthy" | "missing_cost";

export type AuditRow = {
  id: number;
  sku: string | null;
  brand: string | null;
  name: string;
  size: string | null;
  type: string | null;
  season: string | null;
  stock: number;
  ebay_price: number;
  cost_price: number | null;
  price_b2b: number | null;
  price_b2c: number | null;
  fee_estimate: number;
  net_margin: number | null;
  net_margin_pct: number | null;
  verdict: AuditVerdict;
  suggested_price: number | null;
  sold_90d: { units: number; avg_price: number; last_sold_at: string | null } | null;
  ebay_status: string | null;
  ebay_item_id: string | null;
  ebay_sync_error: string | null;
};

export type AuditMeta = {
  counts: { listed: number; loss: number; thin: number; missing_cost: number; healthy: number };
  loss_per_full_sale: number;
  fee_model: { fee_percent: number; fee_fixed: number; thin_margin_percent: number; target_margin_percent: number };
};

export type MarketComparison = {
  count: number;
  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;
  /** Our price vs market average, % (positive = we are dearer). */
  vs_market_pct: number | null;
  note?: string | null;
};

async function authedFetch(path: string, init?: RequestInit): Promise<{ json: Record<string, unknown> | null; error?: string }> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!token) return { json: null, error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    return { json: null, error: "Could not reach the server." };
  }

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.status === 403) return { json: null, error: "You do not have permission for the eBay audit." };
  if (!res.ok) return { json: null, error: (typeof json.message === "string" && json.message) || "Request failed." };
  return { json };
}

export async function getAudit(): Promise<{ rows?: AuditRow[]; meta?: AuditMeta; error?: string }> {
  const { json, error } = await authedFetch("/admin/ebay/audit");
  if (error || !json) return { error };
  return { rows: (json.data as AuditRow[]) ?? [], meta: json.meta as AuditMeta };
}

export async function applyPrice(id: number, price: number): Promise<{ error?: string; message?: string }> {
  const { json, error } = await authedFetch(`/admin/ebay/audit/${id}/apply-price`, {
    method: "POST",
    body: JSON.stringify({ price }),
  });
  if (error || !json) return { error };
  return { message: typeof json.message === "string" ? json.message : undefined };
}

/**
 * Live market comparison for one product — reuses the existing
 * supplier-intel endpoint, which searches eBay for comparable tyres and
 * summarizes competitor pricing.
 */
export async function getMarket(productId: number): Promise<{ market?: MarketComparison; error?: string }> {
  const { json, error } = await authedFetch(`/admin/supplier/for-product/${productId}`);
  if (error || !json) return { error };

  const payload = json as {
    summary?: { count?: number; avg_price?: number | null; min_price?: number | null; max_price?: number | null };
    your_product?: { price_vs_market_pct?: number };
    note?: string | null;
  };
  const summary = payload.summary ?? {};

  return {
    market: {
      count:         summary?.count ?? 0,
      avg_price:     summary?.avg_price ?? null,
      min_price:     summary?.min_price ?? null,
      max_price:     summary?.max_price ?? null,
      vs_market_pct: payload.your_product?.price_vs_market_pct ?? null,
      note:          payload.note ?? null,
    },
  };
}
