import type { Metadata } from "next";
import { AdminInventory } from "@/features/admin/inventory";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Stock levels across every location.",
  robots: { index: false, follow: false },
};

export default function AdminInventoryRoute() {
  return <AdminInventory />;
}
