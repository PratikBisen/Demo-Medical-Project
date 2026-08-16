import type { Metadata } from "next";
import { AdminSellers } from "@/features/admin/sellers";

export const metadata: Metadata = {
  title: "Sellers",
  description: "Seller accounts and live order queue.",
  robots: { index: false, follow: false },
};

export default function AdminSellersRoute() {
  return <AdminSellers />;
}
