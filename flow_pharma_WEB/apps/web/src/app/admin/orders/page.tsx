import type { Metadata } from "next";
import { AdminOrders } from "@/features/admin/orders";

export const metadata: Metadata = {
  title: "Orders",
  description: "All orders across every stage.",
  robots: { index: false, follow: false },
};

export default function AdminOrdersRoute() {
  return <AdminOrders />;
}
