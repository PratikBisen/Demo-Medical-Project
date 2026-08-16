import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Flow Pharma account. Demo accounts are available for customers, sellers and admins.",
  robots: { index: false, follow: false },
};

export default function LoginRoute() {
  return <LoginPage />;
}
