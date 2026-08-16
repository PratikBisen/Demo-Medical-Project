import { apiRequest, ApiError, ApiCodes } from "./http";
import { getDb } from "@/mocks/store";
import type { InventoryItem, Procurement } from "@/types/domain";
import type { Order } from "@/types/order";
import { nowIso, uid } from "@/lib/utils";

export interface SellerQueueItem {
  id: string;
  medicineName: string;
  quantity: number;
  customerSafeId: string;
  status: string;
  time: string;
  action: string;
}

const QUEUE_FLOW: Record<string, string> = {
  APPROVED: "PROCESSING",
  PROCESSING: "FULFILLMENT",
  FULFILLMENT: "COMPLETED",
};

export const sellersService = {
  queue(): Promise<SellerQueueItem[]> {
    return apiRequest({
      url: "/api/v1/seller/queue",
      mock: async () =>
        [...getDb().get("sellerOrders")].sort((a, b) => b.time.localeCompare(a.time)),
    });
  },

  advanceQueue(id: string): Promise<SellerQueueItem> {
    return apiRequest({
      url: `/api/v1/seller/queue/${id}/advance`,
      method: "POST",
      mock: async () => {
        let done: SellerQueueItem | null = null;
        getDb().update("sellerOrders", (items) =>
          items.map((o) => {
            if (o.id !== id) return o;
            const next = QUEUE_FLOW[o.status];
            if (!next) return o;
            done = { ...o, status: next, time: nowIso() };
            return done;
          }),
        );
        if (!done) throw new ApiError(ApiCodes.NOT_FOUND, "Queue item not found.");
        return done;
      },
    });
  },

  orders(): Promise<Order[]> {
    return apiRequest({
      url: "/api/v1/seller/orders",
      mock: async () =>
        getDb()
          .get("orders")
          .filter((o) => o.stage !== "BLOCKED")
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  },

  inventory(): Promise<InventoryItem[]> {
    return apiRequest({
      url: "/api/v1/seller/inventory",
      mock: async () => getDb().get("inventory"),
    });
  },

  updateStock(id: string, newStock: number): Promise<InventoryItem> {
    return apiRequest({
      url: `/api/v1/seller/inventory/${id}`,
      method: "PATCH",
      body: { stock: newStock },
      mock: async () => {
        let done: InventoryItem | null = null;
        getDb().update("inventory", (items) =>
          items.map((i) => {
            if (i.id !== id) return i;
            const stock = Math.max(0, newStock);
            const available = stock - i.reserved;
            done = {
              ...i,
              stock,
              available,
              level: stock === 0 ? "OUT" : available <= i.lowStockThreshold ? "LOW" : "AVAILABLE",
              updatedAt: nowIso(),
            };
            return done;
          }),
        );
        getDb().update("medicines", (meds) =>
          meds.map((m) => {
            const inv = done;
            if (inv && m.id === inv.medicineId) return { ...m, stock: inv.stock };
            return m;
          }),
        );
        if (!done) throw new ApiError(ApiCodes.NOT_FOUND, "Inventory item not found.");
        return done;
      },
    });
  },

  procurement(): Promise<Procurement[]> {
    return apiRequest({
      url: "/api/v1/seller/procurement",
      mock: async () =>
        [...getDb().get("procurement")].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    });
  },

  requestProcurement(medicineName: string, quantity: number, supplier: string): Promise<Procurement> {
    return apiRequest({
      url: "/api/v1/seller/procurement",
      method: "POST",
      body: { medicineName, quantity, supplier },
      mock: async () => {
        const item: Procurement = {
          id: `pr-${uid("n")}`,
          medicineName,
          supplier,
          quantity,
          status: "REQUESTED",
          requestedAt: nowIso(),
        };
        getDb().update("procurement", (items) => [item, ...items]);
        return item;
      },
    });
  },
};

export const adminService = {
  users() {
    return apiRequest({
      url: "/api/v1/admin/users",
      mock: async () => {
        const { authService } = await import("./auth");
        return authService.listAll();
      },
    });
  },

  orders(): Promise<Order[]> {
    return apiRequest({
      url: "/api/v1/admin/orders",
      mock: async () => getDb().get("orders"),
    });
  },

  medicines() {
    return apiRequest({
      url: "/api/v1/admin/medicines",
      mock: async () => getDb().get("medicines"),
    });
  },

  policies() {
    return apiRequest({
      url: "/api/v1/admin/policies",
      mock: async () => getDb().get("policies"),
    });
  },

  updatePolicy(id: string, patch: Record<string, unknown>): Promise<Record<string, unknown>> {
    return apiRequest({
      url: `/api/v1/admin/policies/${id}`,
      method: "PATCH",
      body: patch,
      mock: async () => {
        let done: Record<string, unknown> | null = null;
        getDb().update("policies", (items) =>
          items.map((p) => {
            if (p.id !== id) return p;
            done = { ...p, ...patch, updatedAt: nowIso() };
            return done as unknown as typeof p;
          }),
        );
        if (!done) throw new ApiError(ApiCodes.NOT_FOUND, "Policy not found.");
        return done;
      },
    });
  },

  reviews() {
    return apiRequest({
      url: "/api/v1/admin/reviews",
      mock: async () => getDb().get("safetyDecisions"),
    });
  },

  agents() {
    return apiRequest({
      url: "/api/v1/admin/agents",
      mock: async () => getDb().get("agentRuns"),
    });
  },

  audit() {
    return apiRequest({
      url: "/api/v1/admin/audit",
      mock: async () => getDb().get("audit"),
    });
  },

  inventory() {
    return apiRequest({
      url: "/api/v1/admin/inventory",
      mock: async () => getDb().get("inventory"),
    });
  },

  prescriptions() {
    return apiRequest({
      url: "/api/v1/admin/prescriptions",
      mock: async () => getDb().get("prescriptions"),
    });
  },

  refills() {
    return apiRequest({
      url: "/api/v1/admin/refills",
      mock: async () => getDb().get("refills"),
    });
  },
};
