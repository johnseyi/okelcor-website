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

type QuoteStatus = "new" | "reviewed" | "quoted" | "closed";

export async function updateQuoteStatus(
  id: number,
  status: QuoteStatus
): Promise<{ error?: string }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/quote-requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: json.message || `Failed to update quote status (HTTP ${res.status}).` };
  }

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  return {};
}

// ── Convert quote to order ────────────────────────────────────────────────────

export type ConvertOrderItem = {
  name: string;
  brand: string;
  size: string;
  sku: string | null;
  unit_price: number;
  quantity: number;
};

export type ConvertToOrderPayload = {
  delivery: {
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  items: ConvertOrderItem[];
  delivery_cost: number;
  payment_method: string;
  admin_notes: string;
};

export type ConvertToOrderResult = {
  order_ref: string;
  order_id?: number;
  quote_ref: string;
  status: string;
  payment_status: string;
  total: number;
};

export async function convertQuoteToOrder(
  id: number,
  payload: ConvertToOrderPayload
): Promise<{ data?: ConvertToOrderResult; error?: string; status?: number }> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/quote-requests/${id}/convert-to-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 409) {
    return {
      error: json.message || "This quote has already been converted to an order.",
      status: 409,
    };
  }

  if (res.status === 422) {
    return {
      error: json.message || "This quote must be in 'Quoted' status before it can be converted.",
      status: 422,
    };
  }

  if (!res.ok) {
    return {
      error: json.message || `Failed to convert quote (HTTP ${res.status}).`,
      status: res.status,
    };
  }

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);

  const raw = json.data ?? json;
  return {
    data: {
      order_ref:      raw.order_ref ?? "",
      order_id:       raw.order_id ?? raw.id ?? undefined,
      quote_ref:      raw.quote_ref ?? "",
      status:         raw.status ?? "",
      payment_status: raw.payment_status ?? "",
      total:          raw.total ?? 0,
    },
  };
}
