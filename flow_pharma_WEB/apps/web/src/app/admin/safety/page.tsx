import type { Metadata } from "next";
import { AdminReviews } from "@/features/admin/reviews";

export const metadata: Metadata = {
  title: "Safety Center",
  description: "Review every safety decision with full traces.",
  robots: { index: false, follow: false },
};

export default function AdminReviewsRoute() {
  return <AdminReviews />;
}
