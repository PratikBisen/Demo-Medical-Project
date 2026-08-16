import type { Metadata } from "next";
import { Hero } from "@/components/public/hero";
import { OrderSellPathways } from "@/components/public/order-sell-pathways";
import { HowItWorks } from "@/components/public/how-it-works";
import { ServicesGrid } from "@/components/public/services-grid";
import { AgentVisualization } from "@/components/public/agent-visualization";
import { SafetySection } from "@/components/public/safety-section";
import { CalendarPreview } from "@/components/public/calendar-preview";
import { TrustSection } from "@/components/public/trust-section";
import { FaqPreview } from "@/components/public/faq-preview";

export const metadata: Metadata = {
  title: "Flow Pharma — Your pharmacy, in flow.",
  description:
    "Order medicines through natural conversation — by voice or text. AI-powered pharmacy workflows, smart refills and safety-aware handling in English, Hindi and Marathi.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <OrderSellPathways />
      <HowItWorks />
      <ServicesGrid />
      <AgentVisualization />
      <SafetySection />
      <CalendarPreview />
      <TrustSection />
      <FaqPreview />
    </>
  );
}
