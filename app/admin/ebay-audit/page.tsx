import type { Metadata } from "next";
import EbayAuditBoard from "@/components/admin/ebay-audit-board";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "eBay Price Audit — Admin" };

export default function EbayAuditPage() {
  return <EbayAuditBoard />;
}
