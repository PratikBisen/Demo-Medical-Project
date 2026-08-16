"use client";

import * as React from "react";
import { Truck, Plus } from "lucide-react";
import { useDict } from "@/i18n";
import { useProcurement, useRequestProcurement } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const statusVariant = (s: string) =>
  s === "COMPLETED" ? "success" : s === "FAILED" ? "destructive" : s === "PROCESSING" ? "info" : "secondary";

export function SellerProcurement() {
  const t = useDict();
  const { data: items, isLoading } = useProcurement();
  const request = useRequestProcurement();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ medicineName: "", quantity: "10", supplier: "" });

  const submit = async () => {
    if (!form.medicineName.trim() || !form.supplier.trim()) return;
    await request.mutateAsync({ medicineName: form.medicineName.trim(), quantity: parseInt(form.quantity || "10", 10), supplier: form.supplier.trim() });
    toast({ title: t.seller.orderProcurement, variant: "success" });
    setOpen(false);
    setForm({ medicineName: "", quantity: "10", supplier: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.seller.procurement}</h1>
          <p className="text-sm text-muted-foreground">{t.seller.orderProcurement}</p>
        </div>
        <Button variant="flow" onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden />
          {t.seller.orderProcurement}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-flow-500/10 text-flow-500">
                  <Truck className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.medicineName}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.supplier} · {p.quantity} {t.common.units} · {p.requestedAt.slice(0, 10)}
                  </p>
                  {p.note && <p className="mt-0.5 text-xs text-destructive">{p.note}</p>}
                </div>
              </div>
              <div className="shrink-0">
                <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={t.common.noData} />
      )}

      <Dialog open={open} onOpenChange={setOpen} title={t.seller.orderProcurement} description={t.seller.supplier}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pr-name">{t.common.medicine}</Label>
            <Input id="pr-name" value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} placeholder="e.g. Salbutamol Inhaler" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pr-qty">{t.common.quantity}</Label>
              <Input id="pr-qty" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-supplier">{t.seller.supplier}</Label>
              <Input id="pr-supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="MediSupply Co." />
            </div>
          </div>
          <Button variant="flow" className="w-full" onClick={submit} loading={request.isPending} disabled={!form.medicineName.trim() || !form.supplier.trim()}>
            {t.seller.orderProcurement}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
