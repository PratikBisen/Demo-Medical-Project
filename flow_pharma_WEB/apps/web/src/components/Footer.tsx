"use client";

import React from "react";
import Link from "next/link";
import { Pill, ShieldCheck, HeartPulse, Sparkles } from "lucide-react";
import { useApp } from "@/lib/context";

export function Footer() {
  const { t } = useApp();

  return (
    <footer className="border-t border-border/40 bg-card/40 backdrop-blur-md transition-colors mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
                <Pill className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                FLOW PHARMA
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Autonomous multi-agent pharmacy ecosystem powered by deterministic safety policy rules, multilingual voice intelligence, and automated supply chains.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-500 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Configured Jurisdiction: India (CDSCO Rules)</span>
            </div>
          </div>

          {/* Core Pathways */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 font-mono">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/app/chat" className="hover:text-emerald-400 transition-colors">
                  Conversational AI Ordering
                </Link>
              </li>
              <li>
                <Link href="/app/medicines" className="hover:text-emerald-400 transition-colors">
                  Medicine Master Catalog
                </Link>
              </li>
              <li>
                <Link href="/app/calendar" className="hover:text-emerald-400 transition-colors">
                  Medication & Refill Calendar
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-emerald-400 transition-colors">
                  Seller & Pharmacy Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  Admin & Safety Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Product & Safety */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 font-mono">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/medical-safety" className="hover:text-emerald-400 transition-colors">
                  Medical Safety Baseline
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  4-Agent Architecture
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-emerald-400 transition-colors">
                  Services Overview
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 font-mono">
              Regulatory
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy & Data Security
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About Flow Pharma
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory Safety Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
            <span>Important Medical & Legal Disclaimer</span>
          </div>
          <p>
            Flow Pharma is an autonomous pharmaceutical workflow and policy execution platform. It is <strong>not</strong> a substitute for professional medical diagnosis or clinical healthcare advice. Safety decisions and prescription validations are strictly enforced by deterministic backend rule engines under configured jurisdiction policies.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-4">
          <div>© {new Date().getFullYear()} Flow Pharma. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-500 font-mono">
              <Sparkles className="w-3 h-3" />
              Open-Weights Multi-Agent AI
            </span>
            <span>English • हिन्दी • मराठी</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
