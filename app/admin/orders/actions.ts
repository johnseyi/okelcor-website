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

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

type ShipmentFields = {
  container_number?: string;
  eta?: string;
};

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  shipment?: ShipmentFields
): Promise<{ error?: string }> {
  const token = await getToken();

  const body: Record<string, string> = { status };
  if (shipment?.container_number?.trim()) body.container_number = shipment.container_number.trim();
  if (shipment?.eta)                      body.eta              = shipment.eta;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: json.message || `Failed to update order (HTTP ${res.status}).` };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return {};
}

export async function cancelOrder(id: number): Promise<{ error?: string }> {
  const token = await getToken();

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "cancelled" }),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: (json as { message?: string }).message || `Failed to cancel order (HTTP ${res.status}).` };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return {};
}

export async function deleteOrder(
  id: number,
  confirmRef: string,
): Promise<{ error?: string; deleted?: boolean }> {
  const token = await getToken();

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/orders/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ confirm_ref: confirmRef }),
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Could not reach the server." };
  }

  if (res.status === 422) {
    return { error: "Order reference does not match. Please check and try again." };
  }
  if (res.status === 409) {
    return { error: "Paid orders cannot be deleted." };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: (json as { message?: string }).message || `Failed to delete order (HTTP ${res.status}).` };
  }

  revalidatePath("/admin/orders");
  return { deleted: true };
}
