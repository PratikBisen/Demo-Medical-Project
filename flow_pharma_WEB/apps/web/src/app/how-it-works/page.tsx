import type { Metadata } from "next";
import { HowItWorksPage } from "@/components/public/how-it-works-page";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "From a few spoken words to a safe, tracked pharmacy order — see how Flow Pharma's multi-agent workflow moves your request forward.",
};

export default function HowItWorksRoute() {
  return <HowItWorksPage />;
}
