"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { Menu, X, ArrowRight, UserCheck, ShieldCheck, Store, User, ChevronDown } from "lucide-react";
import { Logo } from "./logo";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useDict } from "@/i18n";
import { authService, demoCredentials } from "@/services/auth";
import { cn } from "@/lib/utils";

const desktopLinks = [
  { href: "/", key: "home" },
  { href: "/how-it-works", key: "howItWorks" },
  { href: "/services", key: "services" },
  { href: "/order", key: "order" },
  { href: "/sell", key: "sell" },
  { href: "/about", key: "about" },
] as const;

export function Navbar() {
  const t = useDict();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [personaOpen, setPersonaOpen] = React.useState(false);
  const { scrollY } = useScroll();

  React.useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 20));
    return () => unsub();
  }, [scrollY]);

  React.useEffect(() => {
    setOpen(false);
    setPersonaOpen(false);
  }, [pathname]);

  const isAppRoute = pathname.startsWith("/app") || pathname.startsWith("/seller") || pathname.startsWith("/admin");
  if (isAppRoute) return null;

  const handleSelectPersona = async (email: string) => {
    try {
      const res = await authService.login({ email, password: "demo1234" });
      setPersonaOpen(false);
      router.push(res.redirectTo ?? "/app");
    } catch {
      setPersonaOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        scrolled
          ? "border-b border-border/70 bg-background/90 backdrop-blur-md shadow-xs"
          : "bg-background/60 backdrop-blur-xs",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main Navigation">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {desktopLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide transition-colors",
                    active
                      ? "text-primary font-semibold bg-primary/8"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {t.nav[link.key]}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {/* Persona Switcher Quick Launch */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setPersonaOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <UserCheck className="size-3.5 text-primary" />
              <span>Demo Portals</span>
              <ChevronDown className={cn("size-3 transition-transform", personaOpen && "rotate-180")} />
            </button>

            {personaOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 z-50">
                <p className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Switch Active Persona
                </p>
                <div className="mt-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => handleSelectPersona("customer@flowpharma.local")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <User className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Rahul Sharma</p>
                        <p className="text-[10px] text-muted-foreground">Patient & Voice Ordering</p>
                      </div>
                    </div>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary">/app</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPersona("seller@flowpharma.local")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold">
                        <Store className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Dr. Vikram Patel</p>
                        <p className="text-[10px] text-muted-foreground">Apex Chemist (Seller Desk)</p>
                      </div>
                    </div>
                    <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-600 dark:text-cyan-400">/seller</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPersona("admin@flowpharma.local")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                        <ShieldCheck className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Safety Administrator</p>
                        <p className="text-[10px] text-muted-foreground">CDSCO Policy Center</p>
                      </div>
                    </div>
                    <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-mono text-purple-600 dark:text-purple-400">/admin</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <LanguageSwitcher compact />
          <ThemeSwitcher />

          <Link
            href="/login"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            {t.nav.signIn}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-border bg-background/98 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === link.href ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t.nav[link.key]}
                  <ArrowRight className="size-3.5 opacity-40" />
                </Link>
              ))}
              <div className="pt-3 border-t border-border/60">
                <Link
                  href="/app"
                  className="flex h-9 w-full items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground"
                >
                  Enter Patient App
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
