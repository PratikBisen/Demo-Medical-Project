import type { Metadata } from "next";
import { SellPage } from "@/components/public/sell-page";

export const metadata: Metadata = {
  title: "Sell Medicine",
  description:
    "Bring your pharmacy into the flow — an operational portal for orders, inventory and procurement, powered by verified workflows.",
};

export default function SellRoute() {
  return <SellPage />;
}
