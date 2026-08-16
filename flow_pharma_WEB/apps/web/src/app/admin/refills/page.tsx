import type { Metadata } from "next";
import { AdminRefills } from "@/features/admin/refills";

export const metadata: Metadata = {
  title: "Refills",
  description: "Upcoming and predicted refills across users.",
  robots: { index: false, follow: false },
};

export default function AdminRefillsRoute() {
  return <AdminRefills />;
}
