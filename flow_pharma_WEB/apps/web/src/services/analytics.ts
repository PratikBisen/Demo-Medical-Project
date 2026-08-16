import { getDb } from "@/mocks/store";
import type { ChartData, Stat } from "@/types/api";
import { addDays, fromISO, toISO, todayISO } from "@/lib/utils";

function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(addDays(todayISO(), -i));
  }
  return out;
}

export interface SellerAnalytics {
  stats: Stat[];
  orderVolume: ChartData;
  inventoryStatus: ChartData;
  procurementStatus: ChartData;
  lowStockList: { name: string; available: number }[];
}

export interface AdminAnalytics {
  stats: Stat[];
  orderVolume: ChartData;
  decisions: ChartData;
  agentPerformance: ChartData;
  orderStages: ChartData;
}

function bucketize(dates: string[], values: number[]): ChartData {
  const days = lastNDays(14);
  const map = new Map(dates.map((d, i) => [d.slice(0, 10), values[i]]));
  return {
    series: days.map((d) => ({ label: d.slice(5), value: map.get(d) ?? 0 })),
    keys: ["value"],
  };
}

export function computeSellerAnalytics(): SellerAnalytics {
  const db = getDb();
  const orders = db.get("orders");
  const inventory = db.get("inventory");
  const procurement = db.get("procurement");
  const sellerOrders = db.get("sellerOrders");

  const active = sellerOrders.filter((o) => o.status !== "COMPLETED").length;
  const completed = sellerOrders.filter((o) => o.status === "COMPLETED").length;
  const lowStock = inventory.filter((i) => i.level === "LOW" || i.level === "OUT");
  const inStock = inventory.filter((i) => i.level === "AVAILABLE").length;

  const volumeDates = orders.map((o) => o.createdAt.slice(0, 10));
  const volumeValues = orders.map(() => 1);

  const orderVolume = bucketize(volumeDates, volumeValues);

  const inventoryStatus: ChartData = {
    series: [
      { label: "In stock", value: inStock },
      { label: "Low", value: lowStock.filter((i) => i.level === "LOW").length },
      { label: "Out", value: lowStock.filter((i) => i.level === "OUT").length },
    ],
    keys: ["value"],
  };

  const procurementStatus: ChartData = {
    series: [
      { label: "Requested", value: procurement.filter((p) => p.status === "REQUESTED").length },
      { label: "Processing", value: procurement.filter((p) => p.status === "PROCESSING").length },
      { label: "Completed", value: procurement.filter((p) => p.status === "COMPLETED").length },
      { label: "Failed", value: procurement.filter((p) => p.status === "FAILED").length },
    ],
    keys: ["value"],
  };

  return {
    stats: [
      { label: "Total orders", value: orders.length + completed },
      { label: "Active orders", value: active },
      { label: "Low stock", value: lowStock.filter((i) => i.level === "LOW").length },
      { label: "Out of stock", value: lowStock.filter((i) => i.level === "OUT").length },
    ],
    orderVolume,
    inventoryStatus,
    procurementStatus,
    lowStockList: lowStock.map((i) => ({ name: i.medicineName, available: i.available })),
  };
}

export function computeAdminAnalytics(): AdminAnalytics {
  const db = getDb();
  const orders = db.get("orders");
  const decisions = db.get("safetyDecisions");
  const agents = db.get("agentRuns");
  const inventory = db.get("inventory");
  const refills = db.get("refills");

  const approved = decisions.filter((d) => d.decision === "APPROVED").length;
  const blocked = decisions.filter((d) => d.decision === "BLOCKED").length;
  const review = decisions.filter((d) => d.decision === "REVIEW").length;
  const total = Math.max(1, decisions.length);

  const agentNames = ["CONVERSATION", "SAFETY", "REFILL", "ACTION"] as const;
  const agentPerformance: ChartData = {
    series: agentNames.map((name) => {
      const runs = agents.filter((a) => a.agent === name);
      return {
        label: name.toLowerCase(),
        value: runs.length
          ? Math.round((runs.filter((r) => r.status === "COMPLETED").length / runs.length) * 100)
          : 100,
      };
    }),
    keys: ["value"],
  };

  const stages: ChartData = {
    series: [
      { label: "active", value: orders.filter((o) => o.stage === "ACTIVE").length },
      { label: "completed", value: orders.filter((o) => o.stage === "COMPLETED").length },
      { label: "blocked", value: orders.filter((o) => o.stage === "BLOCKED").length },
      { label: "review", value: orders.filter((o) => o.stage === "REVIEW").length },
    ],
    keys: ["value"],
  };

  const volumeDates = orders.map((o) => o.createdAt.slice(0, 10));
  const orderVolume = bucketize(volumeDates, orders.map(() => 1));

  return {
    stats: [
      { label: "Total orders", value: orders.length },
      { label: "Approval rate", value: Math.round((approved / total) * 100) },
      { label: "Blocked rate", value: Math.round((blocked / total) * 100) },
      { label: "Review rate", value: Math.round((review / total) * 100) },
      { label: "Inventory alerts", value: inventory.filter((i) => i.level !== "AVAILABLE").length },
      { label: "Refill alerts", value: refills.filter((r) => r.status === "UPCOMING" || r.status === "PREDICTED").length },
    ],
    orderVolume,
    decisions: {
      series: [
        { label: "approved", value: approved },
        { label: "blocked", value: blocked },
        { label: "review", value: review },
      ],
      keys: ["value"],
    },
    agentPerformance,
    orderStages: stages,
  };
}

export { fromISO };
