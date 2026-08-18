// ── Role definitions ───────────────────────────────────────────────────────────

export const ALL_ROLES = [
  "super_admin",
  "admin",
  "order_manager",
  "finance",
  "sales_manager",
  "content_manager",
  "support",
  "editor",
  "viewer",
] as const;

export type AdminRole = (typeof ALL_ROLES)[number];

// ── Section-based access (nav + route guards) ──────────────────────────────────
// Mirrors backend ROLE_ACCESS table.

export const ROLE_ACCESS: Record<string, string[]> = {
  super_admin:     ["operations", "finance", "dashboard", "products", "orders", "quotes", "articles", "hero_slides", "promotions", "fet", "brands", "categories", "media", "settings", "users", "supplier", "customers", "ebay", "analytics", "behaviour", "chats", "security", "eu_declarations", "logistics", "system_health", "crm", "marketing", "partners", "staff_team"],
  admin:           ["operations", "finance", "dashboard", "products", "orders", "quotes", "articles", "hero_slides", "promotions", "fet", "brands", "categories", "media", "settings", "users", "supplier", "customers", "ebay", "analytics", "behaviour", "chats", "security", "eu_declarations", "logistics", "system_health", "crm", "marketing", "partners", "staff_team"],
  order_manager:   ["dashboard", "orders", "quotes", "supplier", "eu_declarations", "logistics", "crm", "marketing", "partners", "behaviour", "operations", "finance", "staff_team"],
  // Reconciliation and the finance half of order sign-off. Deliberately narrow:
  // this role exists to hold one half of a separation of duties, so handing it
  // the rest of the panel would defeat the point of splitting it out.
  finance:         ["dashboard", "orders", "operations", "finance"],
  sales_manager:   ["dashboard", "orders", "quotes", "customers", "analytics", "logistics", "crm", "operations"],
  content_manager: ["dashboard", "articles", "hero_slides", "promotions", "fet", "brands", "media"],
  support:         ["dashboard", "orders", "quotes", "customers", "chats", "logistics"],
  editor:          ["dashboard", "articles", "hero_slides", "promotions", "fet", "media", "behaviour"],
  viewer:          ["dashboard", "analytics"],
};

export function canAccess(role: string, section: string): boolean {
  return ROLE_ACCESS[role]?.includes(section) ?? false;
}

// ── Path → section mapping (shell route guard + middleware) ────────────────────

export const PATH_SECTION: Record<string, string> = {
  // Before "/admin/operations": PATH_SECTION is matched with startsWith() and
  // the first entry wins, so the more specific prefixes must come first.
  // Before "/admin/contribution": PATH_SECTION is matched with startsWith(),
  // so the team view has to be listed ahead of the personal one or every
  // visit to it would resolve to the ungated page.
  "/admin/contribution/team": "staff_team",
  "/admin/operations/clients": "operations",
  "/admin/operations/report":  "operations",
  "/admin/operations":      "operations",
  "/admin/finance-invoices": "finance",
  // Before "/admin/orders": PATH_SECTION is matched with startsWith() and the
  // first entry wins, so the more specific prefix must come first.
  "/admin/orders/in-transit": "orders",
  "/admin/orders/ebay":      "orders",
  "/admin/products":        "products",
  "/admin/orders":          "orders",
  "/admin/quotes":          "quotes",
  "/admin/articles":        "articles",
  "/admin/hero-slides":     "hero_slides",
  "/admin/promotions":      "promotions",
  "/admin/fet":             "fet",
  "/admin/brands":          "brands",
  "/admin/settings":        "settings",
  "/admin/users":           "users",
  "/admin/supplier":        "supplier",
  "/admin/customer-approvals": "customers",
  "/admin/customers":       "customers",
  "/admin/security":        "security",
  "/admin/ebay":            "ebay",
  // Listed before "/admin/analytics": PATH_SECTION is matched with startsWith()
  // and the first entry wins, so the broader prefix must come second.
  "/admin/analytics/behaviour": "behaviour",
  "/admin/analytics":       "analytics",
  "/admin/chats":           "chats",
  "/admin/eu-declarations": "eu_declarations",
  "/admin/logistics":       "logistics",
  "/admin/system-health":   "system_health",
  "/admin/crm":             "crm",
  "/admin/inbox":           "crm",
  "/admin/marketing":       "marketing",
  "/admin/media":           "media",
  "/admin/partners":        "partners",
  "/admin/partner-sales":   "partners",
};

// ── Permission map ─────────────────────────────────────────────────────────────
// Maps permission key → roles that hold it.
// Use canDo() for fine-grained UI gates (buttons, tables, action menus).
// Use canAccess() for page-level route guards.
// Backend enforces the same permissions server-side via middleware.

const PERMISSION_ROLES: Record<string, string[]> = {
  // Admin management
  "admins.manage":         ["super_admin"],
  "admins.roles.assign":   ["super_admin"],

  // Security dashboard
  "security.view":         ["super_admin", "admin", "order_manager", "sales_manager", "content_manager", "support", "editor", "viewer"],
  "security.manage":       ["super_admin"],   // events log, adoption table, 2FA notices

  // Orders
  // NOTE: the backend grants `orders.view` to finance and NOT to support
  // (AdminPermissions.php:37). `finance` is added here because the sign-off
  // feature depends on it — a finance admin must reach the order page to sign.
  // `support` is left in place: removing it would take Orders away from a role
  // that has it in the UI today, which is a product decision, not a typo. It is
  // already a live divergence — support is shown orders the server would 403.
  // Flagged in PROGRESS.md alongside the same-shaped `analytics.view` finding.
  "orders.view":                          ["super_admin", "admin", "order_manager", "sales_manager", "support", "finance"],
  "orders.update":                        ["super_admin", "admin", "order_manager"],
  "orders.delete":                        ["super_admin"],
  // Copied verbatim from AdminPermissions.php:47. Narrower than `orders.view`
  // on purpose: `support` can read the report and cannot export it, so the
  // Export button is hidden for them rather than left to 403.
  "orders.export":                        ["super_admin", "admin", "order_manager", "sales_manager", "finance"],
  "orders.approve_financial_revision":    ["super_admin", "admin"],

  // Dual sign-off on an order confirmation. Copied verbatim from
  // AdminPermissions.php:52-59. `admin` deliberately holds NEITHER half: a
  // control one administrator can satisfy alone is not a separation of duties.
  // These gate *display* only — entitlement to sign is decided by the server's
  // `you_may_sign`, which also enforces the two-different-people rule.
  "orders.signoff_ops":                   ["super_admin", "order_manager"],
  "orders.signoff_finance":               ["super_admin", "finance"],
  "orders.signoff_bypass":                ["super_admin"],

  // Finance-system (sevDesk) invoice recording + reconciliation.
  "finance.view":                         ["super_admin", "admin", "finance", "order_manager"],
  "finance.manage":                       ["super_admin", "admin", "finance"],

  // Payments
  "payments.mark_paid":        ["super_admin", "admin", "order_manager"],
  "payments.release_shipment": ["super_admin", "admin", "order_manager"],
  "payments.refund":           ["super_admin", "admin"],
  // Putting a payment state back to what is true — the only backwards path
  // through the milestone ladder. Same holders as mark_paid; kept on its own
  // key because withdrawing a claim of payment and making one are different
  // acts, even where they are the same people.
  "payments.correct_state":    ["super_admin", "admin", "order_manager"],

  // Products
  "products.view":         ["super_admin", "admin", "editor", "order_manager"],
  "products.edit":         ["super_admin", "admin", "editor"],
  "products.import":       ["super_admin", "admin"],

  // Media
  "media.upload":          ["super_admin", "admin", "editor", "content_manager"],

  // Promotions
  "promotions.manage":     ["super_admin", "admin", "editor", "content_manager"],

  // Articles
  "articles.manage":       ["super_admin", "admin", "editor", "content_manager"],

  // Quotes
  "quotes.manage":         ["super_admin", "admin", "order_manager", "sales_manager"],

  // Customers
  "customers.view":        ["super_admin", "admin", "sales_manager", "support"],
  "customers.create":      ["super_admin", "admin", "sales_manager"],
  "customers.export":      ["super_admin", "admin"],

  // Settings
  "settings.view":         ["super_admin", "admin"],
  "settings.manage":       ["super_admin"],

  // Analytics
  "analytics.view":        ["super_admin", "admin", "sales_manager"],
  // Behaviour analytics is its own permission, copied from the backend's list
  // verbatim (AdminPermissions.php: super_admin, admin, order_manager, editor).
  // Deliberately NOT merged into "analytics.view" above, which diverges from the
  // backend and also gates the Google Analytics page — see PROGRESS.md.
  "behaviour.view":        ["super_admin", "admin", "order_manager", "editor"],

  // Trade documents
  "trade_documents.manage": ["super_admin", "admin", "order_manager"],

  // Partner sales log — overseas partners reporting what they sold.
  // Verification is restricted to roles that actually exist: `sales_manager`
  // appears throughout this map but cannot be stored, because admin_users.role
  // is a DB ENUM missing it. Granting it here would create a permission nobody
  // could hold. Revisit once that ENUM is widened.
  "partners.view":          ["super_admin", "admin", "order_manager"],
  "partners.manage":        ["super_admin", "admin"],
  "partner_sales.view":     ["super_admin", "admin", "order_manager"],
  "partner_sales.verify":   ["super_admin", "admin", "order_manager"],
  "partner_sales.export":   ["super_admin", "admin", "order_manager"],

  // eBay
  "ebay.manage": ["super_admin", "admin"],

  // Carrier shipment tracking (GET /admin/orders/{id}/shipment-tracking)
  "tracking.view":         ["super_admin", "admin", "order_manager", "sales_manager"],

  // System health
  "system.manage":         ["super_admin", "admin"],

  // Marketing contacts & bulk email
  "marketing.manage":      ["super_admin", "admin", "order_manager"],

  // Users / audit
  "users.manage":          ["super_admin", "admin"],
  "audit.view":            ["super_admin"],

  // CRM communications (per-customer thread + unified inbox)
  "crm.view":              ["super_admin", "admin", "order_manager", "sales_manager"],
};

/**
 * Check if a role has a specific permission.
 *
 * Pass `permissions` (from backend auth payload) when available — it takes
 * precedence over the built-in role map, enabling fine-grained per-user
 * overrides without a frontend deploy.
 *
 * Without `permissions`, derives access from the PERMISSION_ROLES map above.
 */
export function canDo(
  role: string,
  permission: string,
  permissions?: string[] | null,
): boolean {
  if (permissions != null) return permissions.includes(permission);
  return PERMISSION_ROLES[permission]?.includes(role) ?? false;
}

// ── Display constants — canonical source ───────────────────────────────────────
// Import from here; do not redefine locally in components.

export const ROLE_LABELS: Record<string, string> = {
  super_admin:     "Super Admin",
  admin:           "Admin",
  order_manager:   "Orders",
  finance:         "Finance",
  sales_manager:   "Sales",
  content_manager: "Content",
  support:         "Support",
  editor:          "Editor",
  viewer:          "Viewer",
};

// Used in the top-bar role badge (admin shell header).
export const ROLE_BADGE_COLORS: Record<string, string> = {
  super_admin:     "bg-gray-900 text-white",
  admin:           "bg-blue-100 text-blue-700",
  order_manager:   "bg-amber-100 text-amber-700",
  finance:         "bg-indigo-100 text-indigo-700",
  sales_manager:   "bg-cyan-100 text-cyan-700",
  content_manager: "bg-violet-100 text-violet-700",
  support:         "bg-teal-100 text-teal-700",
  editor:          "bg-emerald-100 text-emerald-700",
  viewer:          "bg-gray-100 text-gray-600",
};

// Used in card/table role pills (profile page, users manager).
export const ROLE_COLORS: Record<string, string> = {
  super_admin:     "bg-purple-100 text-purple-700",
  admin:           "bg-blue-100 text-blue-700",
  order_manager:   "bg-amber-100 text-amber-700",
  finance:         "bg-indigo-100 text-indigo-700",
  sales_manager:   "bg-cyan-100 text-cyan-700",
  content_manager: "bg-violet-100 text-violet-700",
  support:         "bg-teal-100 text-teal-700",
  editor:          "bg-emerald-100 text-emerald-700",
  viewer:          "bg-gray-100 text-gray-600",
};
