"use client";

import * as React from "react";
import { Users as UsersIcon, Search } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminUsers } from "@/hooks/queries";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const roleVariant = (r: string) =>
  r === "SUPER_ADMIN" ? "destructive" : r === "SELLER" ? "info" : r === "PHARMACIST_REVIEWER" ? "warning" : "secondary";

export function AdminUsers() {
  const t = useDict();
  const { data: users, isLoading } = useAdminUsers();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users ?? [];
    return (users ?? []).filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.users}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.common.search} className="pl-9" aria-label={t.common.search} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => {
            const initials = u.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={u.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar initials={initials} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.fullName}</p>
                    <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <UsersIcon className="size-3" aria-hidden />
                      {u.email}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant={roleVariant(u.role)}>{u.role}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
