import type { Metadata } from "next";
import { SellerProcurement } from "@/features/seller/procurement";

export const metadata: Metadata = {
  title: "Procurement",
  description: "Request and track restock from suppliers.",
  robots: { index: false, follow: false },
};

export default function SellerProcurementRoute() {
  return <SellerProcurement />;
}
