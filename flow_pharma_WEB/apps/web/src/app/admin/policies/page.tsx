import type { Metadata } from "next";
import { AdminPolicies } from "@/features/admin/policies";

export const metadata: Metadata = {
  title: "Policies",
  description: "Configured safety policies per medicine.",
  robots: { index: false, follow: false },
};

export default function AdminPoliciesRoute() {
  return <AdminPolicies />;
}
