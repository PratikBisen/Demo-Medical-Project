import type { Metadata } from "next";
import { SellerDashboard } from "@/features/seller/dashboard";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Run your pharmacy operations in flow.",
  robots: { index: false, follow: false },
};

export default function SellerDashboardRoute() {
  return <SellerDashboard />;
}
