import type { Metadata } from "next";
import { AdminAudit } from "@/features/admin/audit";

export const metadata: Metadata = {
  title: "Audit",
  description: "Immutable audit trail of platform actions.",
  robots: { index: false, follow: false },
};

export default function AdminAuditRoute() {
  return <AdminAudit />;
}
