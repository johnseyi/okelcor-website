import { cookies } from "next/headers";
import type { Customer } from "./customer-auth";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function getCustomerFromCookie(): Promise<Customer | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? data.user ?? data.customer ?? null;
  } catch {
    return null;
  }
}

export async function requireCustomer(redirectTo = "/login"): Promise<Customer> {
  const customer = await getCustomerFromCookie();
  if (!customer) {
    const { redirect } = await import("next/navigation");
    redirect(redirectTo);
  }
  // redirect() throws internally; TypeScript doesn't infer never, so cast is safe
  return customer as Customer;
}
