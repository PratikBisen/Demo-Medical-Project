import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

export function LoadingCard({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-sm", className)} aria-busy="true" aria-label="Loading">
      <Skeleton className="h-4 w-2/5" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-full" />
        ))}
      </div>
    </div>
  );
}

export function LoadingRow({ className }: { className?: string }) {
  return <Skeleton className={cn("h-14 w-full", className)} />;
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20" role="status" aria-label={label ?? "Loading"}>
      <div className="size-8 animate-spin rounded-full border-[3px] border-flow-500/30 border-t-flow-500" aria-hidden />
      <p className="text-sm text-muted-foreground">{label ?? "Loading…"}</p>
    </div>
  );
}
