import type { Metadata } from "next";
import { SellerOrders } from "@/features/seller/orders";

export const metadata: Metadata = {
  title: "Orders",
  description: "Incoming order queue with status controls.",
  robots: { index: false, follow: false },
};

export default function SellerOrdersRoute() {
  return <SellerOrders />;
}
