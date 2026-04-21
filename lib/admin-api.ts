/**
 * lib/admin-api.ts
 *
 * Authenticated API helper for the Okelcor admin panel.
 *
 * - Reads the Sanctum token from the admin_token cookie (server-side only)
 * - Sends Authorization: Bearer {token} on every request
 * - Throws AdminUnauthorizedError on missing token or 401 response
 *   (callers should catch this and redirect to /admin/login)
 * - Throws AdminApiError on any other non-ok response
 */

import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Typed errors ──────────────────────────────────────────────────────────────

export class AdminUnauthorizedError extends Error {
  constructor() {
    super("Admin authentication required");
    this.name = "AdminUnauthorizedError";
  }
}

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export class AdminForbiddenError extends Error {
  constructor() {
    super("Access forbidden — your role does not have permission for this resource");
    this.name = "AdminForbiddenError";
  }
}

// ── Response envelope ─────────────────────────────────────────────────────────

export type AdminApiResponse<T> = {
  data: T;
  meta: {
    total?: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    [key: string]: unknown;
  };
  message: string;
};

// ── Domain types ──────────────────────────────────────────────────────────────

export type AdminProductImage = {
  id: number;
  url: string;
};

export type AdminProduct = {
  id: number;
  brand: string;
  name: string;
  size: string;
  spec?: string;
  season?: string;
  type: string;
  price: number;
  /** List endpoint returns image_url; detail endpoint may return primary_image */
  image_url?: string | null;
  primary_image?: string | null;
  /** Gallery images — admin API returns objects with id + url for deletion support */
  images?: AdminProductImage[];
  sku: string;
  description?: string;
  is_active?: boolean;
  ebay_listed?: boolean;
  created_at?: string;
  deleted_at?: string | null;
};

/** Per-locale content block used in both list and detail article responses. */
export type ArticleTranslation = {
  category: string;
  title: string;
  read_time: string;
  summary: string;
  body: string[];
};

/** Shape returned by GET /admin/articles (list). Text fields are flat top-level strings. */
export type AdminArticle = {
  id: number;
  slug: string;
  title: string;
  category: string;
  /** ISO date string — field name is published_at on the API */
  published_at: string;
  read_time?: string;
  image: string;
  summary?: string;
  is_published?: boolean;
  sort_order?: number;
  created_at?: string;
  deleted_at?: string | null;
};

/** Full article shape returned by GET /admin/articles/{id}. */
export type AdminArticleFull = {
  id: number;
  slug: string;
  image: string;
  /** ISO date string — field name is published_at on the API */
  published_at: string;
  is_published: boolean;
  sort_order?: number;
  translations: {
    en?: ArticleTranslation;
    de?: ArticleTranslation;
    fr?: ArticleTranslation;
    es?: ArticleTranslation;
  };
  created_at?: string;
};

export type AdminOrder = {
  id: number;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | string;
  payment_method?: string;
  payment_status?: "paid" | "unpaid" | "refunded" | string;
  created_at: string;
};

export type AdminOrderItem = {
  id: number;
  product_id?: number;
  product_name: string;
  brand?: string;
  size?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type AdminOrderFull = AdminOrder & {
  phone?: string;
  company_name?: string;
  country?: string;
  address?: string;
  notes?: string;
  container_number?: string;
  tracking_status?: string;
  eta?: string;
  items: AdminOrderItem[];
  updated_at?: string;
};

export type AdminQuote = {
  id: number;
  ref_number: string;
  full_name: string;
  company_name?: string;
  email: string;
  tyre_category: string;
  country: string;
  quantity?: string;
  status: "new" | "reviewed" | "quoted" | "closed" | string;
  created_at: string;
};

export type AdminQuoteFull = AdminQuote & {
  phone?: string;
  delivery_location?: string;
  notes?: string;
  updated_at?: string;
};

export type AdminHeroSlideTranslation = {
  locale: "de" | "fr" | "es";
  title?: string;
  subtitle?: string;
  cta_primary?: string;
  cta_secondary?: string;
};

export type AdminHeroSlide = {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  video_url?: string | null;
  media_type?: "image" | "video";
  order: number;
  cta_primary_label?: string;
  cta_primary_href?: string;
  cta_secondary_label?: string;
  cta_secondary_href?: string;
  translations?: AdminHeroSlideTranslation[];
};

export type AdminBrand = {
  id: number;
  name: string;
  logo_url: string;
  order?: number;
};

export type AdminSetting = {
  key: string;
  value: string;
  label?: string;
  group?: string;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  role_label?: string;
  last_login_at: string | null;
  created_at?: string;
};

export type AdminProfile = {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email: string;
  role: string;
  role_label?: string;
  must_change_password?: boolean;
  last_login_at: string | null;
};

// ── Options ───────────────────────────────────────────────────────────────────

export type AdminFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Extra query params beyond locale */
  params?: Record<string, string | number>;
  /** Next.js ISR revalidation. Pass false for no-store (admin pages are always fresh). */
  revalidate?: number | false;
  tags?: string[];
};

// ── Core fetch ────────────────────────────────────────────────────────────────

export async function adminApiFetch<T>(
  path: string,
  options: AdminFetchOptions = {}
): Promise<AdminApiResponse<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    throw new AdminUnauthorizedError();
  }

  const { method = "GET", body, params, revalidate, tags } = options;

  const url = new URL(`${BASE_URL}/admin${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nextCache: Record<string, any> = {};
  if (revalidate !== undefined) nextCache.revalidate = revalidate;
  if (tags?.length) nextCache.tags = tags;

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(Object.keys(nextCache).length ? { next: nextCache } : {}),
  });

  if (res.status === 401) {
    throw new AdminUnauthorizedError();
  }

  if (res.status === 403) {
    throw new AdminForbiddenError();
  }

  if (!res.ok) {
    throw new AdminApiError(
      res.status,
      `[adminApiFetch] ${method} /admin${path} → HTTP ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<AdminApiResponse<T>>;
}

// ── Convenience: safe fetch (returns null on any error) ───────────────────────

export async function adminSafeFetch<T>(
  path: string,
  options?: AdminFetchOptions
): Promise<AdminApiResponse<T> | null> {
  try {
    return await adminApiFetch<T>(path, options);
  } catch {
    return null;
  }
}
