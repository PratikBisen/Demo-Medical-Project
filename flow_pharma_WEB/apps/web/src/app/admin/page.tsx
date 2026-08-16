import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Platform-wide safety and operations overview.",
  robots: { index: false, follow: false },
};

export default function AdminDashboardRoute() {
  return <AdminDashboard />;
}
