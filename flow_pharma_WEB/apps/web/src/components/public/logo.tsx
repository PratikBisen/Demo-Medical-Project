import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, linkTo = "/" }: { className?: string; linkTo?: string }) {
  return (
    <Link
      href={linkTo}
      className={cn("group inline-flex items-center gap-2.5 select-none", className)}
      aria-label="Flow Pharma home"
    >
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
        <svg
          className="size-5 text-white stroke-[2.2]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Medical cross & botanical leaf intersection */}
          <path d="M12 4v16" />
          <path d="M4 12h16" />
          <circle cx="12" cy="12" r="3" className="fill-emerald-400 stroke-none" opacity="0.4" />
        </svg>
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-extrabold tracking-[0.14em] text-foreground leading-none">
          FLOW<span className="text-primary font-semibold">.PHARMA</span>
        </span>
        <span className="text-[9px] font-mono tracking-wider text-muted-foreground uppercase mt-0.5">
          Autonomous Ecosystem
        </span>
      </div>
    </Link>
  );
}
