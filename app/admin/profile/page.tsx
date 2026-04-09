import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  adminApiFetch,
  AdminUnauthorizedError,
  type AdminProfile,
} from "@/lib/admin-api";
import { cookies } from "next/headers";
import ProfileUI from "@/components/admin/profile-ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile — Admin" };

type Props = { searchParams: Promise<{ first_login?: string }> };

export default async function AdminProfilePage({ searchParams }: Props) {
  const { first_login } = await searchParams;

  let profile: AdminProfile;
  try {
    const res = await adminApiFetch<AdminProfile>("/profile", { revalidate: false });
    profile = res.data;
  } catch (e) {
    if (e instanceof AdminUnauthorizedError) redirect("/admin/login");

    // API profile endpoint not yet available — build from cookies as fallback
    const store = await cookies();
    profile = {
      id: 0,
      name: store.get("admin_name")?.value ?? "",
      email: "",
      role: store.get("admin_role")?.value ?? "",
      last_login_at: null,
    };
  }

  return <ProfileUI profile={profile} firstLogin={first_login === "1"} />;
}
