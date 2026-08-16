import type { Metadata } from "next";
import { AdminSettings } from "@/features/admin/settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Platform language, theme and preferences.",
  robots: { index: false, follow: false },
};

export default function AdminSettingsRoute() {
  return <AdminSettings />;
}
