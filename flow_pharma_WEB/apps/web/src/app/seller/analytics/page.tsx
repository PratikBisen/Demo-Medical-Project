import type { Metadata } from "next";
import { SellerAnalytics } from "@/features/seller/analytics";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Order volume, inventory health and procurement status.",
  robots: { index: false, follow: false },
};

export default function SellerAnalyticsRoute() {
  return <SellerAnalytics />;
}
