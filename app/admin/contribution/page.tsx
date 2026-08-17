import type { Metadata } from "next";
import StaffLedger from "@/components/admin/staff-ledger";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Contribution" };

export default function ContributionPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
          My Contribution
        </p>
        <p className="mt-0.5 max-w-2xl text-[0.875rem] leading-relaxed text-[#5c5e62]">
          What you have worked on, drawn from the records the system already keeps — plus a
          place to enter the work it cannot see. Nothing here measures hours or presence.
        </p>
      </div>

      <StaffLedger />
    </div>
  );
}
