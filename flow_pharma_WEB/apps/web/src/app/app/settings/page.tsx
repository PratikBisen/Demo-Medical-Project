import type { Metadata } from "next";
import { SettingsPage } from "@/features/app/settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Language, theme and preferences.",
  robots: { index: false, follow: false },
};

export default function AppSettingsRoute() {
  return <SettingsPage />;
}
