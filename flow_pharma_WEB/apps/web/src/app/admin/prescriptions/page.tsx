import type { Metadata } from "next";
import { AdminPrescriptions } from "@/features/admin/prescriptions";

export const metadata: Metadata = {
  title: "Prescriptions",
  description: "Uploaded prescriptions and verification status.",
  robots: { index: false, follow: false },
};

export default function AdminPrescriptionsRoute() {
  return <AdminPrescriptions />;
}
