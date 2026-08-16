"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Store,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Boxes,
  Truck,
  Sparkles,
} from "lucide-react";
import { useDict } from "@/i18n";

export function OrderSellPathways() {
  const t = useDict();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-border">
      <div className="mx-auto max-w-2xl text-center mb-10">
        <p className="text-xs font-mono uppercase tracking-wider text-primary">Two Tailored Portals</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          Built for patients, licensed chemists & pharmacists.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Whether you are ordering critical medications for your family or managing a licensed retail dispensary.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Portal Card */}
        <div className="group rounded-2xl border border-border bg-card p-7 transition-all hover:border-primary/40 hover:shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingCart className="size-5" />
              </div>
              <span className="font-mono text-[11px] rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                PATIENT PORTAL
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-foreground">
              Order Medicines & Manage Refills
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Speak or type your prescription in English, Hindi, or Marathi. Get instant safety checks, automated dosage schedule tracking, and 1-click refills before pills run out.
            </p>

            <ul className="mt-5 space-y-2 text-xs text-muted-foreground border-t border-border/60 pt-4">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>Zero-hallucination CDSCO safety verification</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="size-3.5 text-primary" />
                <span>Encrypted digital prescription storage</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-3.5 text-primary" />
                <span>Automated daily dosage calendar & refill forecast</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Link
              href="/order"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>{t.home.orderCardCta}</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Open Patient App</span>
            </Link>
          </div>
        </div>

        {/* Seller / Retail Chemist Card */}
        <div className="group rounded-2xl border border-border bg-card p-7 transition-all hover:border-accent/40 hover:shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Store className="size-5" />
              </div>
              <span className="font-mono text-[11px] rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                LICENSED CHEMISTS
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-foreground">
              Partner with Flow Pharma Network
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Empower your pharmacy with automated CDSCO compliance audits, batch level tracking, pre-verified incoming digital orders, and automated distributor replenishment.
            </p>

            <ul className="mt-5 space-y-2 text-xs text-muted-foreground border-t border-border/60 pt-4">
              <li className="flex items-center gap-2">
                <Boxes className="size-3.5 text-accent" />
                <span>Live batch, stock & cold-chain inventory sync</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="size-3.5 text-accent" />
                <span>1-Click automated supplier procurement</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-accent" />
                <span>Schedule H/H1 audit trail & pharmacist review desk</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              <span>{t.home.sellCardCta}</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/seller"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Seller Control Desk</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
