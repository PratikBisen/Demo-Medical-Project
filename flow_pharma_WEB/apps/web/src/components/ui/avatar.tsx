"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({ className, orientation = "horizontal", ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({ initials, className, tone }: { initials: string; className?: string; tone?: "flow" | "cyan" | "amber" | "violet" }) {
  const tones = {
    flow: "bg-flow-500/15 text-flow-600 dark:text-flow-400",
    cyan: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  };
  return (
    <div
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        tones[tone ?? "flow"],
        className,
      )}
    >
      {initials}
    </div>
  );
}
