import { AdminLayout } from "@/layouts/admin-layout";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
