import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StaffMessageThread from "@/components/admin/staff-message-thread";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Message" };

export default async function StaffMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const messageId = Number(id);

  // The route is the target of the "Open in the admin panel" button in every
  // internal e-mail, so a mangled link should 404 here rather than reaching
  // the API with a NaN.
  if (!Number.isInteger(messageId) || messageId <= 0) notFound();

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-8">
      <StaffMessageThread messageId={messageId} />
    </div>
  );
}
