import type { Metadata } from "next";
import { ContactPage } from "@/components/public/contact-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, feedback or partnership — get in touch with the Flow Pharma team.",
};

export default function ContactRoute() {
  return <ContactPage />;
}
