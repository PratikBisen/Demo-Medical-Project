import type { Metadata } from "next";
import { PrescriptionsPage } from "@/features/app/prescriptions";

export const metadata: Metadata = {
  title: "Prescriptions",
  description: "Your uploaded prescriptions and their status.",
  robots: { index: false, follow: false },
};

export default function AppPrescriptionsRoute() {
  return <PrescriptionsPage />;
}
