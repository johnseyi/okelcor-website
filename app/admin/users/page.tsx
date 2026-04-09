import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  adminApiFetch,
  AdminUnauthorizedError,
  AdminForbiddenError,
  type AdminUser,
} from "@/lib/admin-api";
import UsersManager from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Users — Admin" };

export default async function AdminUsersPage() {
  let users: AdminUser[] = [];
  try {
    const res = await adminApiFetch<AdminUser[]>("/users", { revalidate: false });
    users = res.data ?? [];
  } catch (e) {
    if (e instanceof AdminUnauthorizedError) redirect("/admin/login");
    if (e instanceof AdminForbiddenError) redirect("/admin/unauthorized");
    users = [];
  }

  return (
    <div className="p-6 md:p-8">
      <UsersManager users={users} />
    </div>
  );
}
