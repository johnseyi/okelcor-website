import Link from "next/link";
import { ShieldOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not Authorised" };

export default function AdminUnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <ShieldOff size={24} strokeWidth={1.8} className="text-red-500" />
      </div>
      <h1 className="mt-5 text-[1.3rem] font-extrabold tracking-tight text-[#1a1a1a]">
        Not Authorised
      </h1>
      <p className="mt-2 max-w-sm text-[0.875rem] text-[#5c5e62]">
        Your role does not have permission to access this section. Contact a super admin if you need access.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-flex h-9 items-center gap-2 rounded-full bg-[#E85C1A] px-5 text-[0.83rem] font-semibold text-white transition hover:bg-[#d14f14]"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
