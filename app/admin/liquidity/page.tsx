import type { Metadata } from "next";
import LiquidityLadder from "@/components/admin/liquidity-ladder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Liquidity Weeks" };

export default function LiquidityPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
          Liquidity Weeks
        </p>
        <p className="mt-0.5 text-[0.875rem] text-[#5c5e62]">
          The current week and the three ahead — bank balance and expected movements, rolling with the calendar
        </p>
      </div>
      <LiquidityLadder />
    </div>
  );
}
