import type { Metadata } from "next";
import { OrdersPage } from "@/features/app/orders";

export const metadata: Metadata = {
  title: "Orders",
  description: "Every request, tracked end to end.",
  robots: { index: false, follow: false },
};

export default function AppOrdersRoute() {
  return <OrdersPage />;
}
