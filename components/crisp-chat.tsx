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

    Crisp.configure(process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID);

    // Keep widget in bottom-right so it doesn't overlap the floating bar
    if (typeof window !== "undefined" && window.$crisp) {
      window.$crisp.push(["config", "position:reverse", [true]]);
    }

    // Pass authenticated customer details into Crisp session
    if (customer) {
      Crisp.user.setEmail(customer.email);
      Crisp.user.setNickname(`${customer.first_name} ${customer.last_name}`);
      if (customer.company_name) {
        Crisp.user.setCompany(customer.company_name, {});
      }
    }
  }, [customer, pathname]);

  if (pathname?.startsWith("/admin")) return null;
  return null;
}
