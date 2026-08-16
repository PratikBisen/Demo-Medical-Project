import type { Metadata } from "next";
import { AdminAnalytics } from "@/features/admin/analytics";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Order volume, safety decisions and agent performance.",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsRoute() {
  return <AdminAnalytics />;
}
