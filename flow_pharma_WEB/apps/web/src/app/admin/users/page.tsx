import type { Metadata } from "next";
import { AdminUsers } from "@/features/admin/users";

export const metadata: Metadata = {
  title: "Users",
  description: "All registered accounts and roles.",
  robots: { index: false, follow: false },
};

export default function AdminUsersRoute() {
  return <AdminUsers />;
}
