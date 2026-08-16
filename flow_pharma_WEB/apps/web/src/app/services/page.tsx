import type { Metadata } from "next";
import { ServicesPage } from "@/components/public/services-page";

export const metadata: Metadata = {
  title: "Services",
  description:
    "24/7 availability, conversational and voice ordering, smart refills, medication calendar, prescription-aware safety and multilingual support — in English, Hindi and Marathi.",
};

export default function ServicesRoute() {
  return <ServicesPage />;
}
