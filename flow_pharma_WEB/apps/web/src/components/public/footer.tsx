"use client";

import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";
import { Logo } from "./logo";
import { useDict } from "@/i18n";

export function Footer() {
  const t = useDict();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand Col */}
          <div className="md:col-span-4">
            <Logo />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground max-w-sm">
              Flow Pharma is an autonomous multi-agent healthcare ecosystem providing native voice ordering in English, Hindi, and Marathi with deterministic CDSCO compliance.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
              <ShieldCheck className="size-3 text-primary" />
              <span>CDSCO Compliant · Deterministic Safety</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Clinical Platform
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works & Multi-Agent Trace
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  Clinical Capabilities & Voice AI
                </Link>
              </li>
              <li>
                <Link href="/order" className="text-muted-foreground hover:text-primary transition-colors">
                  Patient Prescription & Order Desk
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-muted-foreground hover:text-primary transition-colors">
                  Licensed Pharmacy Partner Network
                </Link>
              </li>
              <li>
                <Link href="/medical-safety" className="text-muted-foreground hover:text-primary transition-colors">
                  Medical Safety & CDSCO Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Demo Portals */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Demo Portals
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/app" className="text-muted-foreground hover:text-primary transition-colors">
                  Patient App (/app)
                </Link>
              </li>
              <li>
                <Link href="/seller" className="text-muted-foreground hover:text-primary transition-colors">
                  Chemist Portal (/seller)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                  Admin & Safety Center (/admin)
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ & Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact & Clinical Operations
                </Link>
              </li>
            </ul>
          </div>

          {/* Language & Regulatory Notice */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Languages
            </h4>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              English · हिन्दी · मराठी
            </p>
            <p className="mt-4 text-[10px] font-mono text-muted-foreground">
              CDSCO India Form 20B/21B Architecture
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {year} Flow Pharma. Built with deterministic medical safety.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/medical-safety" className="hover:underline">
              Safety Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
