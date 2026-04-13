"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  ClipboardList,
  Layers,
  Star,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
  UserCircle,
  Users,
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";

// ── Navigation items ──────────────────────────────────────────────────────────

const NAV = [
  { label: "Dashboard",      href: "/admin",             icon: LayoutDashboard, roles: null },
  { label: "Products",       href: "/admin/products",    icon: Package,         roles: ["super_admin", "admin", "editor"] },
  { label: "Articles",       href: "/admin/articles",    icon: FileText,        roles: ["super_admin", "admin", "editor"] },
  { label: "Orders",         href: "/admin/orders",      icon: ShoppingCart,    roles: ["super_admin", "admin", "order_manager"] },
  { label: "Quote Requests", href: "/admin/quotes",      icon: ClipboardList,   roles: ["super_admin", "admin", "order_manager"] },
  { label: "Hero Slides",    href: "/admin/hero-slides", icon: Layers,          roles: ["super_admin", "admin", "editor"] },
  { label: "Brands",         href: "/admin/brands",      icon: Star,            roles: ["super_admin", "admin", "editor"] },
  { label: "Settings",       href: "/admin/settings",    icon: Settings,        roles: ["super_admin", "admin", "editor"] },
  { label: "Users",          href: "/admin/users",       icon: Users,           roles: ["super_admin"] },
  { label: "Profile",        href: "/admin/profile",     icon: UserCircle,      roles: null },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin:   "Super Admin",
  admin:         "Admin",
  editor:        "Editor",
  order_manager: "Orders",
};

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  pathname,
  role,
  onClose,
}: {
  pathname: string;
  role: string;
  onClose: () => void;
}) {
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const visibleNav = NAV.filter(({ roles }) =>
    roles === null || roles.includes(role) || !role
  );

  return (
    <div className="flex h-full flex-col bg-[#1a1a1a]">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-5">
        <Image
          src="/logo/okelcor-logo.png"
          alt="Okelcor"
          width={120}
          height={32}
          className="h-8 w-auto object-contain brightness-0 invert"
          priority
        />
        <span className="rounded-full bg-[#E85C1A]/15 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
          Admin
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {visibleNav.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={[
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.875rem] font-medium transition-all",
                active
                  ? "bg-[#E85C1A] text-white shadow-sm"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white",
              ].join(" ")}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2.2 : 1.8}
                className="shrink-0"
              />
              <span className="flex-1 truncate">{label}</span>
              {active && (
                <ChevronRight size={13} strokeWidth={2.5} className="shrink-0 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-white/[0.08] p-3">
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[0.875rem] font-medium text-white/50 transition-all hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut size={16} strokeWidth={1.8} className="shrink-0" />
            <span>Log out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState("");
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    setRole(getCookie("admin_role"));
    setAdminName(getCookie("admin_name"));
  }, []);

  // Login page — bare layout, no shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Derive active page label for the top bar
  const activePage =
    NAV.find(({ href }) =>
      href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
    )?.label ?? "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — fixed on mobile, static on desktop ── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 w-60 transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar pathname={pathname} role={role} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── Main column ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-4 lg:px-6">

          {/* Left: hamburger (mobile) + page title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1a1a1a] transition hover:bg-[#f0f2f5] lg:hidden"
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
            <h1 className="text-[0.95rem] font-extrabold text-[#1a1a1a]">
              {activePage}
            </h1>
          </div>

          {/* Right: role badge + admin avatar */}
          <div className="flex items-center gap-3">
            {role && (
              <span className="hidden rounded-full bg-[#f0f2f5] px-2.5 py-0.5 text-[0.72rem] font-semibold text-[#5c5e62] sm:block">
                {ROLE_LABELS[role] ?? role}
              </span>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E85C1A] text-[0.72rem] font-extrabold text-white">
              {adminName
                ? adminName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                : "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>

      </div>
    </div>
  );
}
