"use client";

import * as React from "react";
import { ScrollText, Pencil, TriangleAlert } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminPolicies, useUpdatePolicy } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export function AdminPolicies() {
  const t = useDict();
  const { data: policies, isLoading } = useAdminPolicies();
  const update = useUpdatePolicy();
  const { toast } = useToast();
  const [editing, setEditing] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Record<string, unknown>>({});

  const current = (policies ?? []).find((p) => p.id === editing) ?? null;

  const openEditor = (id: string) => {
    const p = policies?.find((x) => x.id === id);
    if (!p) return;
    setEditing(id);
    setDraft({ rxRequired: p.rxRequired, saleAllowed: p.saleAllowed, restricted: p.restricted, maxQty: p.maxQty, minAge: p.minAge, humanReview: p.humanReview });
  };

  const save = async () => {
    if (!editing) return;
    await update.mutateAsync({ id: editing, patch: draft });
    toast({ title: t.admin.savePolicy, variant: "success" });
    setConfirmOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.policies}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.warningPolicy}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : !policies || policies.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="space-y-3">
          {policies.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <ScrollText className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.medicineName}</p>
                  <p className="text-xs text-muted-foreground">
                    max {p.maxQty} · age {p.minAge}+ · {p.jurisdiction} · v{/* updatedAt short */} {p.updatedAt.slice(0, 10)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <Badge variant={p.saleAllowed ? "success" : "destructive"}>{p.saleAllowed ? "Sale" : "Blocked"}</Badge>
                {p.rxRequired && <Badge variant="warning">Rx required</Badge>}
                {p.humanReview && <Badge variant="info">Human review</Badge>}
                <Button variant="outline" size="sm" onClick={() => openEditor(p.id)}>
                  <Pencil className="size-3.5" aria-hidden />
                  {t.common.edit}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!current} onOpenChange={(open) => { if (!open) setEditing(null); }} title={current?.medicineName ?? ""} description={t.admin.policyReason}>
        {current && (
          <div className="space-y-4">
            {(
              [
                { key: "saleAllowed", label: "Sale allowed" },
                { key: "rxRequired", label: "Prescription required" },
                { key: "restricted", label: "Restricted" },
                { key: "humanReview", label: "Human review" },
              ] as const
            ).map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <span className="text-sm">{item.label}</span>
                <Switch checked={!!draft[item.key]} onCheckedChange={(v) => setDraft((d) => ({ ...d, [item.key]: v }))} ariaLabel={item.label} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pol-maxqty">{t.common.quantity} (max)</Label>
                <Input id="pol-maxqty" type="number" min={1} value={String(draft.maxQty ?? current.maxQty)} onChange={(e) => setDraft((d) => ({ ...d, maxQty: parseInt(e.target.value || "0", 10) }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pol-minage">{t.seller.available} (min age)</Label>
                <Input id="pol-minage" type="number" min={0} value={String(draft.minAge ?? current.minAge)} onChange={(e) => setDraft((d) => ({ ...d, minAge: parseInt(e.target.value || "0", 10) }))} />
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{t.admin.confirmEdit}</span>
            </div>
            <Button variant="destructive" className="w-full" onClick={() => setConfirmOpen(true)}>
              {t.admin.savePolicy}
            </Button>
          </div>
        )}
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen} title={t.admin.confirmEdit} description={t.admin.warningPolicy}>
        <p className="text-sm text-muted-foreground">{t.admin.policyReason}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="destructive" onClick={save} loading={update.isPending}>{t.admin.savePolicy}</Button>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>{t.common.cancel}</Button>
        </div>
      </Dialog>
    </div>
  );
}
