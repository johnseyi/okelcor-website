"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";
import { usePathname } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $crisp: any[];
  }
}

export default function CrispChat() {
  const pathname = usePathname();
  const { customer } = useCustomerAuth();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (!process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID) return;

    Crisp.configure(process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID, {
      autoload: true,
    });

    if (typeof window !== "undefined") {
      // Ensure $crisp queue exists before pushing
      window.$crisp = window.$crisp || [];

      // Bottom-right position (does not overlap content)
      window.$crisp.push(["config", "position:reverse", [false]]);

      // Compact launcher on mobile — expands to full chat on tap
      window.$crisp.push(["config", "container:index", [99]]);

      // Smooth entry animation offset — lifts widget slightly from edge
      window.$crisp.push(["safe", true]);
    }
  // Only run on mount / pathname change, not on every customer update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (!process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID) return;
    if (!customer) return;

    try {
      Crisp.user.setEmail(customer.email);
      Crisp.user.setNickname(`${customer.first_name} ${customer.last_name}`);
      if (customer.company_name) {
        Crisp.user.setCompany(customer.company_name, {});
      }
    } catch {
      // Crisp not yet ready — silently skip
    }
  }, [customer, pathname]);

  if (pathname?.startsWith("/admin")) return null;
  return null;
}
