import { Sparkles } from "lucide-react";

export function DemoBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md border border-flow-500/20 bg-flow-500/5 px-3 py-1.5 text-xs text-flow-600 dark:text-flow-400">
      <Sparkles className="size-3.5 shrink-0" aria-hidden />
      <span>{message ?? "Demo environment — simulated data, not a live backend."}</span>
    </div>
  );
}
