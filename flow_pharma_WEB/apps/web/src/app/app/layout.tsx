import { AppLayout } from "@/layouts/app-layout";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function CustomerAppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
