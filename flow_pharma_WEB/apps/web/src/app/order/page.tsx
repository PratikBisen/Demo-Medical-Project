import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderPage } from "@/components/public/order-page";

export const metadata: Metadata = {
  title: "Order Medicine",
  description:
    "Tell Flow what you need in natural text or by voice. Orders run through configured safety and policy checks before they move forward.",
  robots: { index: true, follow: true },
};

export default function OrderRoute() {
  return (
    <Suspense fallback={null}>
      <OrderPage />
    </Suspense>
  );
}
