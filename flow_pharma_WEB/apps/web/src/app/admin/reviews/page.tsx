"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck, User, Clock } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviewCases, setReviewCases] = useState([
    {
      id: 1,
      uuid: "rc-8812-a",
      medicineName: "Tramadol 50mg",
      patientName: "Rahul Sharma",
      reviewType: "RESTRICTED_SCHEDULE_H1",
      reason: "Schedule H1 restricted medication flagged by Policy Engine for mandatory pharmacist sign-off.",
      status: "PENDING",
      timestamp: "2026-08-15 16:45 UTC",
    },
    {
      id: 2,
      uuid: "rc-8813-b",
      medicineName: "Paracetamol 500mg (High Qty)",
      patientName: "Amit Kumar",
      reviewType: "HIGH_QUANTITY_THRESHOLD",
      reason: "Requested 12 strips (Exceeds default single order safety limit of 10 strips).",
      status: "PENDING",
      timestamp: "2026-08-15 15:30 UTC",
    },
  ]);

  const resolveCase = (id: number, action: "APPROVED" | "REJECTED") => {
    setReviewCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: action } : c))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          Pharmacist Review Cases Queue
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Mandatory human-in-the-loop validation for restricted schedules, high quantities, and safety flags.
        </p>
      </div>

      <div className="space-y-4">
        {reviewCases.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-3xl border border-border bg-card/70 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-sm text-foreground">Case #{c.uuid}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                    c.status === "PENDING"
                      ? "bg-amber-500/20 text-amber-400"
                      : c.status === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {c.status}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{c.timestamp}</span>
              </div>

              <div>
                <div className="font-bold text-base text-foreground">
                  {c.medicineName} • Patient: {c.patientName}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.reason}</div>
              </div>

              <div className="text-[11px] font-mono text-purple-400">Type: {c.reviewType}</div>
            </div>

            {c.status === "PENDING" ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => resolveCase(c.id, "REJECTED")}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Order</span>
                </button>

                <button
                  onClick={() => resolveCase(c.id, "APPROVED")}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pharmacist Sign-Off & Approve</span>
                </button>
              </div>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-mono font-semibold text-muted-foreground">
                Resolved: {c.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
