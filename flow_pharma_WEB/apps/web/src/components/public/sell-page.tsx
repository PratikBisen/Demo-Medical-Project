"use client";

import Link from "next/link";
import { Store, PackageCheck, ArrowRight, Package, ShoppingCart, TrendingUp, ShieldCheck, Boxes, Truck } from "lucide-react";
import { useDict } from "@/i18n";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/shared/demo-banner";

const SELLER_PILLARS = [
  {
    icon: ShoppingCart,
    title: "Pre-Screened Digital Orders",
    desc: "Receive customer prescriptions already validated by deterministic CDSCO safety rules, saving dispensing pharmacist review time.",
  },
  {
    icon: Boxes,
    title: "Batch & Expiry Level Sync",
    desc: "Track available shelf stock, cold-storage units, reserved batches, and automated near-expiry alerts (>180 days threshold).",
  },
  {
    icon: Truck,
    title: "1-Click Wholesaler Procurement",
    desc: "Automated replenishment workflows directly connected to licensed pharmaceutical distributors when stock drops below threshold.",
  },
  {
    icon: ShieldCheck,
    title: "Regulatory Compliance & Audit",
    desc: "Automatic generation of Form 20B/21B digital dispensing logs with full trace hashes and patient verification records.",
  },
];

export function SellPage() {
  const t = useDict();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <PageHeader
        title="Partner with Flow Pharma Network"
        subtitle="Empower your licensed pharmacy with automated CDSCO compliance, real-time batch management, and digital customer orders."
      />

      <div className="mb-8">
        <DemoBanner />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {SELLER_PILLARS.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-4 text-base font-bold text-foreground">{f.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button size="lg" className="bg-primary text-primary-foreground font-semibold" asChild>
          <Link href="/register?type=seller">
            <span>Register Your Licensed Pharmacy</span>
            <ArrowRight className="size-4 ml-1" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/seller">
            <Store className="size-4 mr-2" />
            <span>Launch Seller Control Desk</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
