import type { Metadata } from "next";
import { AppDashboard } from "@/features/app/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your pharmacy overview — active orders, upcoming refills and notifications.",
  robots: { index: false, follow: false },
};

export default function AppDashboardRoute() {
  return <AppDashboard />;
}
