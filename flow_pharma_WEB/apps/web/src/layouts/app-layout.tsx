"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, Package, Pill, CalendarDays, RefreshCcw,
  FileText, User, LogOut, Menu, X, Sparkles,
} from "lucide-react";
import { useDict } from "@/i18n";
import { Logo } from "@/components/public/logo";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";

const navItems = [
  { href: "/app", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/app/chat", labelKey: "chat", icon: MessageSquare },
  { href: "/app/orders", labelKey: "orders", icon: Package },
  { href: "/app/medicines", labelKey: "medicines", icon: Pill },
  { href: "/app/calendar", labelKey: "calendar", icon: CalendarDays },
  { href: "/app/refills", labelKey: "refills", icon: RefreshCcw },
  { href: "/app/prescriptions", labelKey: "prescriptions", icon: FileText },
] as const;

const bottomNav = navItems.slice(0, 5);

export function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useDict();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState(() => authService.current());
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const current = authService.current();
    if (!current) {
      router.replace("/login");
      return;
    }
    if (current.role !== "CUSTOMER") {
      router.replace(current.role === "SELLER" ? "/seller" : current.role === "SUPER_ADMIN" ? "/admin" : "/login");
      return;
    }
    setUser(current);
  }, [router]);

  const labelFor = (key: string) => {
    const map: Record<string, string> = {
      dashboard: t.app.nav.dashboard,
      chat: t.app.nav.chat,
      orders: t.app.nav.orders,
      medicines: t.app.nav.medicines,
      calendar: t.app.nav.calendar,
      refills: t.app.nav.refills,
      prescriptions: t.app.nav.prescriptions,
    };
    return map[key] ?? key;
  };

  const signOut = () => {
    authService.logout();
    router.replace("/");
  };

  if (!user) return null;

  const initials = user.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const SidebarNav = ({ compact = false }: { compact?: boolean }) => (
    <nav className={cn("flex flex-col gap-1", compact ? "px-2" : "px-3")} aria-label={t.app.nav.dashboard}>
      {navItems.map((item) => {
        const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-flow-500/10 text-flow-600 dark:text-flow-400" : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
            )}
          >
            <Icon className={cn("size-[18px] shrink-0", active && "text-flow-500 dark:text-flow-400")} aria-hidden />
            {!compact && <span className="truncate">{labelFor(item.labelKey)}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card/60 backdrop-blur lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
        <div className="border-t border-border p-3">
          <Link href="/app/profile" className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/10">
            <Avatar initials={initials} className="bg-flow-500/15 text-flow-600 dark:text-flow-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-[18px]" aria-hidden />
            {t.common.logout}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent/10"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Logo />
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: mobileOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        className="fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card lg:hidden"
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
        </div>
        <div className="py-4">
          <SidebarNav />
        </div>
        <div className="border-t border-border p-3">
          <Link href="/app/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg p-2">
            <Avatar initials={initials} className="bg-flow-500/15 text-flow-600 dark:text-flow-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Main */}
      <div className="relative lg:pl-60">
        {/* Desktop header */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur lg:flex">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-flow-500" aria-hidden />
            <span>{t.brand.name} · {t.brand.aiOnline}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <NotificationBell />
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/90 backdrop-blur lg:hidden" aria-label="Mobile">
          {bottomNav.map((item) => {
            const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium", active ? "text-flow-600 dark:text-flow-400" : "text-muted-foreground")}>
                <Icon className="size-5" aria-hidden />
                <span>{labelFor(item.labelKey)}</span>
              </Link>
            );
          })}
          <Link href="/app/profile" className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium", pathname === "/app/profile" ? "text-flow-600 dark:text-flow-400" : "text-muted-foreground")}>
            <User className="size-5" aria-hidden />
            <span>{t.common.profile}</span>
          </Link>
        </nav>

        <main className="pb-24 pt-16 lg:pb-10 lg:pt-6">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
