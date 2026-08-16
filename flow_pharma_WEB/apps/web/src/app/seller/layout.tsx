import { SellerLayout } from "@/layouts/seller-layout";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function SellerAppLayout({ children }: { children: React.ReactNode }) {
  return <SellerLayout>{children}</SellerLayout>;
}
