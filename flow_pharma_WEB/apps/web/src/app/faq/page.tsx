import type { Metadata } from "next";
import { FaqPage } from "@/components/public/faq-page";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Straight answers about how Flow Pharma works — voice ordering, supported languages, prescriptions, refill predictions and more.",
};

export default function FaqRoute() {
  return <FaqPage />;
}
