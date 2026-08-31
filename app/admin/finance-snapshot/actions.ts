"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Types (mirror the API's payload) ──────────────────────────────────────────

export type SnapshotItem = {
  id: number;
  category: string;
  person: string;
  assigned_admin_id: number | null;
  assignee_name: string | null;
  ref: string;
  date: string | null;
  client: string | null;
  status: string;
  comment: string | null;
  amount: number;
};

export type LiquidityEntry = {
  id: number;
  line: string;
  /** Legacy two-period bucket — '' on week-keyed entries. */
  period: string;
  /** ISO week the entry lives in, e.g. '2026-W35'. Null on legacy rows. */
  week_key: string | null;
  supplier: string | null;
  description: string;
  reference: string | null;
  amount: number;
  currency: string;
  comment: string | null;
};

export type LiquidityInput = {
  line: string;
  week_key: string;
  supplier?: string | null;
  description?: string | null;
  amount: number;
  currency?: string | null;
  comment?: string | null;
};

export type SnapshotMeta = {
  categories: string[];
  statuses: string[];
  liquidity_lines: { key: string; label: string }[];
  /**
   * Cash Position = bank_balance + these; Forecasted = + revenue_payment.
   * Served by the API so the grid's arithmetic cannot drift from its rows.
   */
  liquidity_expense_lines: string[];
  /**
   * The server's current ISO week ('2026-W36'). Weeks before it are CLOSED:
   * the API refuses writes landing in them, and the grid marks the columns.
   * Served so the panel and the refusals share one clock.
   */
  current_week: string;
  /** Active admin users, for the assign-to-staff picker. */
  staff: { id: number; name: string }[];
};

export type SnapshotPayload = {
  items: SnapshotItem[];
  liquidity: LiquidityEntry[];
  meta: SnapshotMeta;
};

export type ItemInput = {
  category: string;
  person: string;
  /** Tagging a real staff member notifies them and feeds their My Work queue. */
  assigned_admin_id?: number | null;
  ref: string;
  date?: string | null;
  client?: string | null;
  status?: string;
  comment?: string | null;
  amount: number;
};

// ── Shared request helper ─────────────────────────────────────────────────────

async function api(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<{ json: Record<string, unknown> | null; error?: string }> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!token) return { json: null, error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/finance-snapshot${path}`, {
      method: init?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    return { json: null, error: "Could not reach the server." };
  }

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (res.status === 403) return { json: null, error: "You do not have permission for this." };
  if (!res.ok) {
    return { json: null, error: (typeof json.message === "string" && json.message) || "Request failed." };
  }
  return { json };
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function getSnapshot(): Promise<{ data?: SnapshotPayload; error?: string }> {
  const { json, error } = await api("");
  if (error || !json) return { error };
  return { data: json.data as SnapshotPayload };
}

export async function createItem(input: ItemInput): Promise<{ item?: SnapshotItem; error?: string }> {
  const { json, error } = await api("/items", { method: "POST", body: input });
  if (error || !json) return { error };
  return { item: json.data as SnapshotItem };
}

export async function updateItem(id: number, input: ItemInput): Promise<{ item?: SnapshotItem; error?: string }> {
  const { json, error } = await api(`/items/${id}`, { method: "PUT", body: input });
  if (error || !json) return { error };
  return { item: json.data as SnapshotItem };
}

export async function deleteItem(id: number): Promise<{ error?: string }> {
  const { error } = await api(`/items/${id}`, { method: "DELETE" });
  return { error };
}

export async function bulkAddItems(items: ItemInput[]): Promise<{ error?: string; message?: string }> {
  const { json, error } = await api("/items/bulk", { method: "POST", body: { items } });
  if (error || !json) return { error };
  return { message: typeof json.message === "string" ? json.message : undefined };
}

export async function createLiquidityEntry(input: LiquidityInput): Promise<{ entry?: LiquidityEntry; error?: string }> {
  const { json, error } = await api("/liquidity", { method: "POST", body: input });
  if (error || !json) return { error };
  return { entry: json.data as LiquidityEntry };
}

export async function updateLiquidityEntry(id: number, input: LiquidityInput): Promise<{ entry?: LiquidityEntry; error?: string }> {
  const { json, error } = await api(`/liquidity/${id}`, { method: "PUT", body: input });
  if (error || !json) return { error };
  return { entry: json.data as LiquidityEntry };
}

export async function deleteLiquidityEntry(id: number): Promise<{ error?: string }> {
  const { error } = await api(`/liquidity/${id}`, { method: "DELETE" });
  return { error };
}

/**
 * Restores a backup in the exact shape the old D13 board exports —
 * `{ items: [...], liquidityItems: [...] }` — REPLACING the whole board.
 */
export async function restoreBackup(backup: unknown): Promise<{ error?: string; message?: string }> {
  const { json, error } = await api("/import", { method: "POST", body: backup });
  if (error || !json) return { error };
  return { message: typeof json.message === "string" ? json.message : undefined };
}
