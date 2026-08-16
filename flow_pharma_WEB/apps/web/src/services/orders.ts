import { apiRequest, ApiError, ApiCodes } from "./http";
import { getDb } from "@/mocks/store";
import type { Order, CreateOrderRequest, OrderFilters } from "@/types/order";
import type { Decision } from "@/types/common";
import { uid, nowIso } from "@/lib/utils";

const STEP_LABELS = [
  "request-received",
  "medicine-identified",
  "safety-check",
  "prescription",
  "inventory",
  "approved",
  "processing",
  "fulfillment",
  "delivered",
] as const;

export interface OrderProposal {
  order: Order | null;
  decision: Decision;
  reason: string;
  checks: { name: string; passed: boolean; details: string }[];
  rxRequired: boolean;
  traceId: string;
}

function buildTimeline(completedThrough: number, current: boolean, rxRequired: boolean): Order["timeline"] {
  return STEP_LABELS.map((key, i) => ({
    key,
    label: key,
    time: i <= completedThrough ? "10:00" : undefined,
    completed: i <= completedThrough,
    current: current && i === completedThrough,
  }));
}

export function evaluateOrder(
  medicineId: string,
  quantity: number,
  opts: { rxProvided?: boolean } = {},
): OrderProposal {
  const db = getDb();
  const medicine = db.get("medicines").find((m) => m.id === medicineId);
  if (!medicine) {
    throw new ApiError(ApiCodes.NOT_FOUND, "Medicine not found.");
  }
  const policy = db.get("policies").find((p) => p.medicineId === medicineId);
  const checks: OrderProposal["checks"] = [];

  if (!medicine.saleAllowed) {
    checks.push({ name: "Sale policy", passed: false, details: "sale_allowed = false" });
    return {
      order: null,
      decision: "BLOCKED",
      reason: "Sale is prohibited under the configured jurisdiction policy.",
      checks,
      rxRequired: medicine.rxRequired,
      traceId: `tr-${uid("blk")}`,
    };
  }
  checks.push({ name: "Sale policy", passed: true, details: "Permitted in jurisdiction" });

  if (medicine.stock - medicine.reserved < quantity) {
    checks.push({ name: "Stock available", passed: false, details: `Need ${quantity}, have ${medicine.stock - medicine.reserved}` });
    return {
      order: null,
      decision: "BLOCKED",
      reason: "The requested quantity is not available right now.",
      checks,
      rxRequired: medicine.rxRequired,
      traceId: `tr-${uid("stk")}`,
    };
  }
  checks.push({ name: "Stock available", passed: true, details: `${medicine.stock - medicine.reserved} available` });

  if (quantity > medicine.maxQty) {
    checks.push({ name: "Max quantity", passed: false, details: `${quantity} > ${medicine.maxQty}` });
    return {
      order: null,
      decision: "BLOCKED",
      reason: `This medicine allows a maximum of ${medicine.maxQty} units per order.`,
      checks,
      rxRequired: medicine.rxRequired,
      traceId: `tr-${uid("max")}`,
    };
  }
  checks.push({ name: "Max quantity", passed: true, details: `${quantity} ≤ ${medicine.maxQty}` });

  if (medicine.rxRequired && !opts.rxProvided) {
    checks.push({ name: "Prescription", passed: false, details: "Valid prescription required" });
    return {
      order: null,
      decision: "REVIEW",
      reason: "This medicine requires a valid prescription before the order can proceed.",
      checks,
      rxRequired: true,
      traceId: `tr-${uid("rx")}`,
    };
  }
  checks.push({ name: "Prescription", passed: true, details: "Prescription on file" });

  if (medicine.restricted) {
    checks.push({ name: "Human review", passed: false, details: "Restricted category" });
    return {
      order: null,
      decision: "REVIEW",
      reason: "This restricted medicine requires a pharmacist review before it can continue.",
      checks,
      rxRequired: medicine.rxRequired,
      traceId: `tr-${uid("rev")}`,
    };
  }

  checks.push({ name: "Policy review", passed: true, details: policy ? "v" + policy.id.slice(-2) : "default" });

  const total = medicine.unitPrice * quantity;
  const order: Order = {
    id: `ord-${uid("o")}`,
    customerId: "usr-customer",
    medicineId,
    medicineName: medicine.name,
    strength: medicine.strength,
    quantity,
    unitPrice: medicine.unitPrice,
    total,
    status: "APPROVED",
    stage: "ACTIVE",
    rxRequired: medicine.rxRequired,
    rxProvided: !!opts.rxProvided,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    sellerName: "Apex City Chemist & Care",
    deliveryAddress: "402 Palm Heights, Powai, Mumbai",
    traceId: `tr-${uid("ord")}`,
    customerSafeId: "CUS-7712",
    timeline: buildTimeline(5, true, medicine.rxRequired),
  };
  return { order, decision: "APPROVED", reason: "All configured checks passed.", checks, rxRequired: medicine.rxRequired, traceId: order.traceId };
}

export const ordersService = {
  list(filters?: OrderFilters): Promise<Order[]> {
    return apiRequest({
      url: "/api/v1/orders",
      body: filters,
      mock: async () => {
        let items = getDb().get("orders");
        if (filters?.stage) {
          items = items.filter((o) => o.stage === filters.stage);
        }
        if (filters?.query) {
          const q = filters.query.toLowerCase();
          items = items.filter((o) => o.medicineName.toLowerCase().includes(q) || o.id.includes(q));
        }
        return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
    });
  },

  get(id: string): Promise<Order> {
    return apiRequest({
      url: `/api/v1/orders/${id}`,
      mock: async () => {
        const order = getDb().get("orders").find((o) => o.id === id);
        if (!order) throw new ApiError(ApiCodes.NOT_FOUND, "Order not found.");
        return order;
      },
    });
  },

  create(req: CreateOrderRequest): Promise<OrderProposal> {
    return apiRequest({
      url: "/api/v1/orders",
      method: "POST",
      body: req,
      mock: async () => {
        const proposal = evaluateOrder(req.medicineId, req.quantity, { rxProvided: req.rxProvided });
        if (proposal.order) {
          getDb().update("orders", (orders) => [proposal.order as Order, ...orders]);
        }
        getDb().update("safetyDecisions", (decisions) => [
          {
            id: `sd-${uid("d")}`,
            traceId: proposal.traceId,
            medicineName: req.medicineId,
            decision: proposal.decision,
            reason: proposal.reason,
            policyVersion: 1,
            checks: proposal.checks,
            timestamp: nowIso(),
          },
          ...decisions,
        ]);
        return proposal;
      },
    });
  },

  /** Demo helper: advance a seller-side order through the pipeline. */
  advance(id: string): Promise<Order> {
    return apiRequest({
      url: `/api/v1/seller/orders/${id}/advance`,
      method: "POST",
      mock: async () => {
        let updated: Order | null = null;
        getDb().update("orders", (orders) =>
          orders.map((o) => {
            if (o.id !== id) return o;
            const currentIdx = o.timeline.findIndex((t) => t.current);
            const idx = currentIdx === -1 ? o.timeline.findIndex((t) => !t.completed) : currentIdx;
            if (idx === -1 || idx >= o.timeline.length - 1) return o;
            const timeline = o.timeline.map((t, i) => ({
              ...t,
              completed: i <= idx + 1,
              current: i === idx + 1,
              time: i <= idx + 1 ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
            }));
            updated = { ...o, timeline, updatedAt: nowIso(), status: timeline[idx + 1].key.toUpperCase() as Order["status"] };
            return updated;
          }),
        );
        if (!updated) throw new ApiError(ApiCodes.NOT_FOUND, "Order not found.");
        return updated;
      },
    });
  },
};
