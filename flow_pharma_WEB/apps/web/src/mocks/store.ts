import { seedMedicines, seedPolicies, seedOrders, seedEvents, seedPrescriptions, seedRefills, seedNotifications, seedSafetyDecisions, seedAgentRuns, seedAudit, seedInventory, seedProcurement, seedSellerOrders } from "./data";

const KEY = "flow-db";

export interface DbShape {
  medicines: typeof seedMedicines;
  policies: typeof seedPolicies;
  orders: typeof seedOrders;
  events: typeof seedEvents;
  prescriptions: typeof seedPrescriptions;
  refills: typeof seedRefills;
  notifications: typeof seedNotifications;
  safetyDecisions: typeof seedSafetyDecisions;
  agentRuns: typeof seedAgentRuns;
  audit: typeof seedAudit;
  inventory: typeof seedInventory;
  procurement: typeof seedProcurement;
  sellerOrders: typeof seedSellerOrders;
}

function seed(): DbShape {
  return {
    medicines: seedMedicines.map((m) => ({ ...m })),
    policies: seedPolicies.map((p) => ({ ...p })),
    orders: seedOrders.map((o) => ({ ...o, timeline: o.timeline.map((t) => ({ ...t })) })),
    events: seedEvents.map((e) => ({ ...e })),
    prescriptions: seedPrescriptions.map((p) => ({ ...p })),
    refills: seedRefills.map((r) => ({ ...r })),
    notifications: seedNotifications.map((n) => ({ ...n })),
    safetyDecisions: seedSafetyDecisions.map((s) => ({ ...s, checks: s.checks.map((c) => ({ ...c })) })),
    agentRuns: seedAgentRuns.map((a) => ({ ...a, steps: a.steps.map((s) => ({ ...s })) })),
    audit: seedAudit.map((a) => ({ ...a })),
    inventory: seedInventory.map((i) => ({ ...i })),
    procurement: seedProcurement.map((p) => ({ ...p })),
    sellerOrders: seedSellerOrders.map((o) => ({ ...o })),
  };
}

function load(): DbShape {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as DbShape;
  } catch {
    return seed();
  }
}

function persist(db: DbShape) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      // storage full / unavailable — keep in memory only
    }
  }
}

class MockDb {
  private db: DbShape;
  constructor() {
    this.db = load();
  }
  get<K extends keyof DbShape>(key: K): DbShape[K] {
    return this.db[key];
  }
  set<K extends keyof DbShape>(key: K, value: DbShape[K]) {
    this.db[key] = value;
    persist(this.db);
  }
  update<K extends keyof DbShape>(key: K, fn: (prev: DbShape[K]) => DbShape[K]) {
    this.db[key] = fn(this.db[key]);
    persist(this.db);
  }
  reset() {
    this.db = seed();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(KEY);
    }
  }
}

let instance: MockDb | null = null;

export function getDb(): MockDb {
  if (!instance) instance = new MockDb();
  return instance;
}
