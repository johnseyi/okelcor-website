import type { Metadata } from "next";
import FinanceSnapshotBoard from "@/components/admin/finance-snapshot-board";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Finance Snapshot — Admin" };

export default function FinanceSnapshotPage() {
  return <FinanceSnapshotBoard />;
}
