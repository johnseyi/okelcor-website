// ─── Types ────────────────────────────────────────────────────────────────────

export type Customer = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  customer_type: "B2C" | "B2B";
  email_verified: boolean;
  company_name?: string;
  vat_number?: string;
  industry?: string;
};

export type RegisterData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  country?: string;
  customer_type: "B2C" | "B2B";
  company_name?: string;
  vat_number?: string;
  industry?: string;
};

export type ProfileData = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  company_name?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw err;
  }
  return res.json();
}

// ─── Auth functions ───────────────────────────────────────────────────────────

export async function registerCustomer(data: RegisterData) {
  return apiFetch("/api/auth/customer/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<{ customer: Customer; email_verified: boolean; must_reset: boolean }> {
  return apiFetch("/api/auth/customer/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutCustomer() {
  return apiFetch("/api/auth/customer/logout", { method: "POST" });
}

export async function forgotPassword(email: string) {
  return apiFetch("/api/auth/customer/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  email: string,
  password: string,
  passwordConfirmation: string
) {
  return apiFetch("/api/auth/customer/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
}

export async function getCustomerProfile(): Promise<Customer> {
  const data = await apiFetch("/api/auth/customer/me");
  return data.data ?? data.user ?? data.customer ?? data;
}

export async function updateCustomerProfile(data: ProfileData) {
  return apiFetch("/api/auth/customer/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
