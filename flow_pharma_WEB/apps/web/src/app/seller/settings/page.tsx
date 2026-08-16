import type { Metadata } from "next";
import { SellerSettings } from "@/features/seller/settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Language, theme and notification preferences.",
  robots: { index: false, follow: false },
};

export default function SellerSettingsRoute() {
  return <SellerSettings />;
}
