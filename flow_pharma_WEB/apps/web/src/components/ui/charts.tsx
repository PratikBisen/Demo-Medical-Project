"use client";

import * as React from "react";
import type { ChartData } from "@/types/api";
import { cn } from "@/lib/utils";

const palette = ["#00b27e", "#22d3ee", "#f59e0b", "#8b5cf6", "#ef4444", "#94a3b8"];

export function BarChart({ data, height = 180, className }: { data: ChartData; height?: number; className?: string }) {
  const max = Math.max(1, ...data.series.map((s) => s.value));
  return (
    <div className={className} role="img" aria-label="Bar chart">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.series.map((s, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {s.value}
            </span>
            <div
              className="w-full max-w-8 rounded-t-md transition-all"
              style={{
                height: `${Math.max(4, (s.value / max) * (height - 24))}px`,
                backgroundColor: palette[i % palette.length],
                opacity: 0.9,
              }}
            />
            <span className="truncate text-[10px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ data, size = 160, className }: { data: ChartData; size?: number; className?: string }) {
  const total = Math.max(1, data.series.reduce((acc, s) => acc + s.value, 0));
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted/50" strokeWidth={stroke} />
        {data.series.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={palette[i % palette.length]}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-xl font-bold" dominantBaseline="middle">
          {total}
        </text>
        <text x="50%" y="60%" textAnchor="middle" className="fill-muted-foreground text-[10px]" dominantBaseline="middle">
          total
        </text>
      </svg>
      <ul className="space-y-1.5">
        {data.series.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: palette[i % palette.length] }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-medium tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LineChart({ data, height = 160, className }: { data: ChartData; height?: number; className?: string }) {
  const w = 600;
  const h = height;
  const pad = 8;
  const max = Math.max(1, ...data.series.map((s) => s.value));
  const step = data.series.length > 1 ? (w - pad * 2) / (data.series.length - 1) : 0;
  const points = data.series.map((s, i) => {
    const x = pad + (data.series.length > 1 ? i * step : 0);
    const y = h - pad - (s.value / max) * (h - pad * 2);
    return { x, y, s };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className={className} role="img" aria-label="Line chart">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00b27e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00b27e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L${points[points.length - 1]?.x ?? pad},${h - pad} L${pad},${h - pad} Z`} fill="url(#line-fill)" />
        <path d={path} fill="none" stroke="#00b27e" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#00b27e" />
            <title>{`${p.s.label}: ${p.s.value}`}</title>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{data.series[0]?.label}</span>
        <span>{data.series[data.series.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function ProgressBar({ value, className, tone = "flow" }: { value: number; className?: string; tone?: "flow" | "amber" | "red" | "cyan" }) {
  const tones = {
    flow: "bg-flow-500",
    amber: "bg-amber-500",
    red: "bg-destructive",
    cyan: "bg-cyan-500",
  };
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full transition-all duration-500", tones[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
