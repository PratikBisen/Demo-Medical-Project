import type { Metadata } from "next";
import { RefillsPage } from "@/features/app/refills";

export const metadata: Metadata = {
  title: "Refills",
  description: "Upcoming, predicted, completed and dismissed refills.",
  robots: { index: false, follow: false },
};

export default function AppRefillsRoute() {
  return <RefillsPage />;
}
