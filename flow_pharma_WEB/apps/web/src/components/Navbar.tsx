"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context";
import { Language } from "@/lib/i18n";
import { AIStatusIndicator } from "./AIStatusIndicator";
import {
  Pill,
  MessageSquareText,
  Calendar,
  Package,
  FileText,
  RefreshCw,
  Store,
  ShieldAlert,
  Moon,
  Sun,
  Globe,
  User,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

export function Navbar() {
  const { language, setLanguage, t, theme, setTheme, currentUser, switchDemoUser } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/app/chat", label: t.nav.chat, icon: MessageSquareText },
    { href: "/app/medicines", label: t.nav.medicines, icon: Pill },
    { href: "/app/orders", label: t.nav.orders, icon: Package },
    { href: "/app/calendar", label: t.nav.calendar, icon: Calendar },
    { href: "/app/refills", label: t.nav.refills, icon: RefreshCw },
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/seller", label: t.nav.sellerPortal, icon: Store },
    { href: "/admin", label: t.nav.adminPortal, icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs transition-transform duration-200 group-hover:scale-105">
              <Pill className="size-4.5 stroke-[2.2]" />
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-widest text-foreground leading-none">
                FLOW<span className="text-primary font-semibold">.PHARMA</span>
              </span>
              <span className="text-[9px] tracking-wider font-mono text-muted-foreground uppercase mt-0.5">
                Autonomous Ecosystem
              </span>
            </div>
          </Link>

          {/* AI Status Badge */}
          <div className="hidden lg:block">
            <AIStatusIndicator />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.slice(0, 5).map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls (Language, Theme, User Switcher) */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-secondary/60 text-xs font-mono transition-colors"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span className="uppercase font-semibold">{language}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-border bg-card shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setLanguage("en");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                    language === "en" ? "bg-emerald-500/15 text-emerald-500 font-semibold" : "hover:bg-secondary"
                  }`}
                >
                  <span>English</span>
                  <span className="font-mono text-[10px] text-muted-foreground">EN</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage("hi");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                    language === "hi" ? "bg-emerald-500/15 text-emerald-500 font-semibold" : "hover:bg-secondary"
                  }`}
                >
                  <span>हिन्दी</span>
                  <span className="font-mono text-[10px] text-muted-foreground">HI</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage("mr");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                    language === "mr" ? "bg-emerald-500/15 text-emerald-500 font-semibold" : "hover:bg-secondary"
                  }`}
                >
                  <span>मराठी</span>
                  <span className="font-mono text-[10px] text-muted-foreground">MR</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-border bg-card/60 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Demo User Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium transition-all shadow-2xs"
            >
              <div className="size-4.5 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="size-3 text-primary" />
              </div>
              <span className="hidden sm:inline font-mono text-[11px]">{currentUser.role}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-border/50 mb-1.5">
                  <div className="text-xs font-semibold">{currentUser.fullName}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">{currentUser.email}</div>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground px-3 py-1 uppercase tracking-wider">
                  Switch Demo Persona:
                </div>
                <button
                  onClick={() => {
                    switchDemoUser("CUSTOMER");
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between mb-1 ${
                    currentUser.role === "CUSTOMER" ? "bg-emerald-500/15 text-emerald-500 font-semibold" : "hover:bg-secondary"
                  }`}
                >
                  <div>
                    <div>Rahul Sharma</div>
                    <div className="text-[10px] text-muted-foreground">Customer (Patient)</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] font-mono">App</span>
                </button>
                <button
                  onClick={() => {
                    switchDemoUser("SELLER");
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between mb-1 ${
                    currentUser.role === "SELLER" ? "bg-cyan-500/15 text-cyan-400 font-semibold" : "hover:bg-secondary"
                  }`}
                >
                  <div>
                    <div>Dr. Vikram Patel</div>
                    <div className="text-[10px] text-muted-foreground">Apex Chemist (Seller)</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] font-mono">Seller</span>
                </button>
                <button
                  onClick={() => {
                    switchDemoUser("SUPER_ADMIN");
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between mb-1 ${
                    currentUser.role === "SUPER_ADMIN" ? "bg-purple-500/15 text-purple-400 font-semibold" : "hover:bg-secondary"
                  }`}
                >
                  <div>
                    <div>Super Administrator</div>
                    <div className="text-[10px] text-muted-foreground">Safety & Policies</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-[10px] font-mono">Admin</span>
                </button>
                <button
                  onClick={() => {
                    switchDemoUser("PHARMACIST_REVIEWER");
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                    currentUser.role === "PHARMACIST_REVIEWER" ? "bg-amber-500/15 text-amber-400 font-semibold" : "hover:bg-secondary"
                  }`}
                >
                  <div>
                    <div>Dr. Pooja Mehta (R.Ph)</div>
                    <div className="text-[10px] text-muted-foreground">Pharmacist Reviewer</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] font-mono">Review</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-border bg-card/60"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          <div className="pb-2 border-b border-border/50">
            <AIStatusIndicator />
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary"
              >
                {Icon && <Icon className="w-4 h-4 text-emerald-500" />}
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
