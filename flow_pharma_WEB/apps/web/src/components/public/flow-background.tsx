"use client";

import * as React from "react";

export function FlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft, clinical ambient illumination */}
      <div
        className="absolute -top-48 left-1/2 -translate-x-1/2 w-[72rem] h-[36rem] rounded-full blur-3xl opacity-20 dark:opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(158 65% 40%), hsl(175 75% 32%), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -left-32 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(158 65% 45%), transparent 70%)",
        }}
      />
    </div>
  );
}
