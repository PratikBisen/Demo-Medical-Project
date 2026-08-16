import type { Metadata } from "next";
import { SellerProfile } from "@/features/seller/profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your pharmacy account details.",
  robots: { index: false, follow: false },
};

export default function SellerProfileRoute() {
  return <SellerProfile />;
}
