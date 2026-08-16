"use client";

import * as React from "react";
import { FileText, Upload, File, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useDict } from "@/i18n";
import { usePrescriptions, useUploadPrescription } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusBadge = (s: string) =>
  s === "VERIFIED"
    ? { variant: "success" as const, icon: CheckCircle2 }
    : s === "REJECTED"
      ? { variant: "destructive" as const, icon: AlertTriangle }
      : { variant: "warning" as const, icon: Clock };

export function PrescriptionsPage() {
  const t = useDict();
  const { data: prescriptions, isLoading } = usePrescriptions();
  const upload = useUploadPrescription();
  const { toast } = useToast();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await upload.mutateAsync({ name: file.name, size: file.size, type: file.type });
      toast({ title: t.app.uploadPrescription, description: file.name, variant: "success" });
    } catch {
      toast({ title: t.auth.registerError, variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.app.prescriptionsTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.app.prescriptionsSubtitle}</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.png,.jpeg" className="hidden" onChange={handleFile} />
        <Button variant="flow" onClick={() => fileRef.current?.click()} loading={upload.isPending}>
          {!upload.isPending && <Upload className="size-4" aria-hidden />}
          {t.app.uploadPrescription}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : prescriptions && prescriptions.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {prescriptions.map((rx) => {
            const st = statusBadge(rx.status);
            const Icon = st.icon;
            return (
              <div key={rx.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <FileText className="size-5" aria-hidden />
                  </div>
                  <Badge variant={st.variant}>
                    <Icon className="size-3" aria-hidden />
                    {rx.status}
                  </Badge>
                </div>
                <h2 className="mt-3 font-semibold">{rx.doctorName}</h2>
                <p className="text-xs text-muted-foreground">{rx.clinic}</p>
                {rx.medicines.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{t.app.relatedMedicines}:</span> {rx.medicines.join(", ")}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <File className="size-3.5 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-xs">{rx.file?.name ?? "—"}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {rx.file ? `${Math.round(rx.file.size / 1024)} KB` : ""}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>{t.common.date}: {formatDate(rx.issuedAt)}</span>
                  <span className={cn("font-mono")}>{rx.traceId}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title={t.common.noData} description={t.app.prescriptionsSubtitle} />
      )}
    </div>
  );
}
