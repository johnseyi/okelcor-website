"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "./data";
import { useLanguage } from "@/context/language-context";

export default function ShopBreadcrumb({ product }: { product: Product }) {
  const { t } = useLanguage();
  return (
    <nav className="flex items-center gap-1.5 text-[0.82rem] text-[var(--muted)]">
      <Link href="/" className="transition hover:text-[var(--foreground)]">
        {t.nav.home}
      </Link>
      <ChevronRight size={13} className="shrink-0 opacity-50" />
      <Link href="/shop" className="transition hover:text-[var(--foreground)]">
        {t.nav.shop}
      </Link>
      <ChevronRight size={13} className="shrink-0 opacity-50" />
      <span className="max-w-[200px] truncate text-[var(--foreground)] font-medium sm:max-w-none">
        {product.brand} {product.name}
      </span>
    </nav>
  );
}
