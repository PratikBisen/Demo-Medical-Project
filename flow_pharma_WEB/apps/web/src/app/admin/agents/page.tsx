import type { Metadata } from "next";
import { AdminAgents } from "@/features/admin/agents";

export const metadata: Metadata = {
  title: "Agents",
  description: "Structured traces for every agent run.",
  robots: { index: false, follow: false },
};

export default function AdminAgentsRoute() {
  return <AdminAgents />;
}
