import type { Metadata } from "next";
import { MedicinesPage } from "@/features/app/medicines";

export const metadata: Metadata = {
  title: "Medicines",
  description: "Your current medicines at a glance.",
  robots: { index: false, follow: false },
};

export default function AppMedicinesRoute() {
  return <MedicinesPage />;
}
