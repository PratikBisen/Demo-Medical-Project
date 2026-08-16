"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShieldCheck, Users, Store, Pill, ScrollText, Package,
  Boxes, FileText, CalendarClock, Bot, ListChecks, BarChart3, Settings, LogOut,
} from "lucide-react";
import { useDict } from "@/i18n";
import { Logo } from "@/components/public/logo";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";

const navItems = [
  { href: "/admin", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/safety", labelKey: "safety", icon: ShieldCheck },
  { href: "/admin/users", labelKey: "users", icon: Users },
  { href: "/admin/sellers", labelKey: "sellers", icon: Store },
  { href: "/admin/medicines", labelKey: "medicines", icon: Pill },
  { href: "/admin/policies", labelKey: "policies", icon: ScrollText },
  { href: "/admin/orders", labelKey: "orders", icon: Package },
  { href: "/admin/inventory", labelKey: "inventory", icon: Boxes },
  { href: "/admin/prescriptions", labelKey: "prescriptions", icon: FileText },
  { href: "/admin/refills", labelKey: "refills", icon: CalendarClock },
  { href: "/admin/agents", labelKey: "agents", icon: Bot },
  { href: "/admin/audit", labelKey: "audit", icon: ListChecks },
  { href: "/admin/analytics", labelKey: "analytics", icon: BarChart3 },
  { href: "/admin/settings", labelKey: "settings", icon: Settings },
] as const;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useDict();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState(() => authService.current());

  React.useEffect(() => {
    const current = authService.current();
    if (!current) {
      router.replace("/login");
      return;
    }
    if (current.role !== "SUPER_ADMIN" && current.role !== "PHARMACIST_REVIEWER") {
      router.replace(current.role === "SELLER" ? "/seller" : "/app");
      return;
    }
    setUser(current);
  }, [router]);

  const labelFor = (key: string) => {
    const map: Record<string, string> = {
      dashboard: t.admin.dashboard,
      safety: t.admin.safetyCenter,
      users: t.admin.users,
      sellers: t.admin.sellers,
      medicines: t.admin.medicines,
      policies: t.admin.policies,
      orders: t.admin.orders,
      inventory: t.admin.inventory,
      prescriptions: t.admin.prescriptions,
      refills: t.admin.refills,
      agents: t.admin.agents,
      audit: t.admin.audit,
      analytics: t.admin.analytics,
      settings: t.admin.settings,
    };
    return map[key] ?? key;
  };

  const signOut = () => {
    authService.logout();
    router.replace("/");
  };

  if (!user) return null;

  const initials = user.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card/60 backdrop-blur lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <Logo />
          <span className="rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Admin
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t.admin.dashboard}>
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-[18px] shrink-0", active && "text-violet-500 dark:text-violet-400")} aria-hidden />
                  <span className="truncate">{labelFor(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="border-t border-border p-3">
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/10">
            <Avatar initials={initials} className="bg-violet-500/15 text-violet-600 dark:text-violet-400" />
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

      <div className="relative lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-violet-500" aria-hidden />
            {t.admin.title}
          </span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </header>

        <main className="pb-16 pt-6 lg:pb-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
