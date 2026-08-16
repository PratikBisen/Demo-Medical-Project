import type { Metadata } from "next";
import { ProfilePage } from "@/features/app/profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your account information.",
  robots: { index: false, follow: false },
};

export default function AppProfileRoute() {
  return <ProfilePage />;
}
