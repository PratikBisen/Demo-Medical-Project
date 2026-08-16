"use client";

import * as React from "react";
import { Search, Boxes, Pencil } from "lucide-react";
import { useDict } from "@/i18n";
import { useSellerInventory, useUpdateStock } from "@/hooks/queries";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const levelVariant = (l: string) => (l === "OUT" ? "destructive" : l === "LOW" ? "warning" : "success");
const levelLabel = (l: string) => (l === "OUT" ? "Out of stock" : l === "LOW" ? "Low stock" : "In stock");

export function SellerInventory() {
  const t = useDict();
  const { data: inventory, isLoading } = useSellerInventory();
  const update = useUpdateStock();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<string | null>(null);
  const [value, setValue] = React.useState("0");

  const filtered = React.useMemo(() => {
    let items = inventory ?? [];
    const q = query.trim().toLowerCase();
    if (q) items = items.filter((i) => i.medicineName.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
    return items;
  }, [inventory, query]);

  const current = inventory?.find((i) => i.id === editing) ?? null;

  const openEditor = (id: string, stock: number) => {
    setEditing(id);
    setValue(String(stock));
  };

  const save = async () => {
    if (!editing) return;
    const parsed = Math.max(0, parseInt(value || "0", 10));
    await update.mutateAsync({ id: editing, stock: parsed });
    toast({ title: t.seller.updateStockDone, variant: "success" });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.seller.inventory}</h1>
        <p className="text-sm text-muted-foreground">{t.common.stock}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.common.search} className="pl-9" aria-label={t.common.search} />
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="success">{levelLabel("AVAILABLE")}</Badge>
          <Badge variant="warning">{levelLabel("LOW")}</Badge>
          <Badge variant="destructive">{levelLabel("OUT")}</Badge>
        </div>
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
          {filtered.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-flow-500/10 text-flow-500">
                  <Boxes className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{i.medicineName}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.strength} · {i.location} · expires {i.expiry}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{i.available} <span className="text-xs font-normal text-muted-foreground">{t.seller.available}</span></p>
                  <p className="text-xs text-muted-foreground">{i.reserved} {t.seller.reserved} · {i.stock} {t.common.stock}</p>
                </div>
                <Badge variant={levelVariant(i.level)}>{i.level}</Badge>
                <Button variant="outline" size="sm" onClick={() => openEditor(i.id, i.stock)}>
                  <Pencil className="size-3.5" aria-hidden />
                  {t.seller.updateStock}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!current} onOpenChange={(open) => { if (!open) setEditing(null); }} title={current?.medicineName ?? ""} description={t.seller.updateStock}>
        {current && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.common.stock}</p>
                <p className="text-lg font-bold tabular-nums">{current.stock}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.seller.reserved}</p>
                <p className="text-lg font-bold tabular-nums">{current.reserved}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.seller.available}</p>
                <p className="text-lg font-bold tabular-nums">{current.available}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-input">{t.common.quantity}</Label>
              <Input id="stock-input" type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} aria-label={t.common.quantity} />
            </div>
            <Button variant="flow" className="w-full" onClick={save} loading={update.isPending}>
              {t.common.save}
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
