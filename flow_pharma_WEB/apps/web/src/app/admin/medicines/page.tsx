import type { Metadata } from "next";
import { AdminMedicines } from "@/features/admin/medicines";

export const metadata: Metadata = {
  title: "Medicines",
  description: "Catalog with schedules, pricing and availability.",
  robots: { index: false, follow: false },
};

export default function AdminMedicinesRoute() {
  return <AdminMedicines />;
}
