import type { Metadata } from "next";
import MyWork from "@/components/admin/my-work";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Work" };

// Deep link from a tagged finance task. Same contract as ?todo= on the
// to-do list and ?line= on the EC Invoice List: the task is worked here, so
// the link lands on the row rather than on the finance snapshot board — which
// most assignees cannot open at all.
type SearchParams = Promise<{ finance_item?: string }>;

export default async function MyWorkPage({ searchParams }: { searchParams: SearchParams }) {
  const { finance_item: financeItem } = await searchParams;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]">
          My Work
        </p>
        <p className="mt-0.5 text-[0.875rem] text-[#5c5e62]">
          Everything assigned to you that needs action — leads, follow-ups, proposals and approvals.
        </p>
      </div>

      <MyWork highlightFinanceItem={financeItem ? Number(financeItem) : null} />
    </div>
  );
}
