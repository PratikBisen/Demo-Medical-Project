import type { Metadata } from "next";
import { SellerInventory } from "@/features/seller/inventory";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Stock, reserved and available levels with low-stock visibility.",
  robots: { index: false, follow: false },
};

export default function SellerInventoryRoute() {
  return <SellerInventory />;
}
