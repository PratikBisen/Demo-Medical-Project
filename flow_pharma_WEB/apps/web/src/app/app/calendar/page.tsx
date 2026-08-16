import type { Metadata } from "next";
import { CalendarPage } from "@/features/app/calendar";

export const metadata: Metadata = {
  title: "Medication Calendar",
  description: "Medication, refill and prescription events in one view.",
  robots: { index: false, follow: false },
};

export default function AppCalendarRoute() {
  return <CalendarPage />;
}
