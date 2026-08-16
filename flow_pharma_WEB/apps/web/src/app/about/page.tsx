import type { Metadata } from "next";
import { AboutPage } from "@/components/public/about-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "Flow Pharma reimagines how medicine is ordered and delivered — an autonomous pharmacy ecosystem with clearly bounded AI agents, reviewable safety and a connected customer, seller and admin experience.",
};

export default function AboutRoute() {
  return <AboutPage />;
}
