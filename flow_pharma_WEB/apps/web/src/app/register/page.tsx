import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterPage } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Flow Pharma account — as a customer or as a seller.",
  robots: { index: false, follow: false },
};

export default function RegisterRoute() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
