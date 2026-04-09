"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("admin_token")?.value ?? null;
}

export async function createUser(data: {
  name: string;
  email: string;
  role: string;
  password: string;
}): Promise<{ error?: string; id?: number }> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 403) return { error: "Only super admins can manage users." };
  if (!res.ok) return { error: json.message || "Failed to create user." };

  revalidatePath("/admin/users");
  return { id: json.data?.id };
}

export async function updateUser(
  id: number,
  data: { name: string; email: string; role: string; password?: string }
): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  const payload: Record<string, string> = {
    name: data.name,
    email: data.email,
    role: data.role,
  };
  if (data.password?.trim()) payload.password = data.password;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 403) return { error: "Only super admins can manage users." };
  if (!res.ok) return { error: json.message || "Failed to update user." };

  revalidatePath("/admin/users");
  return {};
}

export async function deleteUser(id: number): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server." };
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 403) return { error: "Only super admins can manage users." };
  if (!res.ok) return { error: json.message || "Failed to delete user." };

  revalidatePath("/admin/users");
  return {};
}
