import type {
  EventType,
  NotificationType,
  PrescriptionStatus,
  RefillConfidence,
  RefillStatus,
  AgentStatus,
  ProcurementStatus,
  InventoryLevel,
} from "./common";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  medicineId?: string;
  medicineName?: string;
  orderId?: string;
  status: "SCHEDULED" | "COMPLETED" | "DISMISSED";
  predicted: boolean;
  source: "REFILL_PREDICTION" | "ORDER_CONFIRMED" | "PRESCRIPTION" | "MANUAL";
}

export interface Prescription {
  id: string;
  doctorName: string;
  clinic: string;
  medicines: string[];
  status: PrescriptionStatus;
  issuedAt: string;
  expiresAt?: string;
  file?: { name: string; size: number; type: string };
  traceId: string;
}

export interface Refill {
  id: string;
  medicineId: string;
  medicineName: string;
  strength: string;
  expectedDate: string;
  confidence: RefillConfidence;
  status: RefillStatus;
  quantity: number;
  reason: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action?: { label: string; href: string };
}

export interface AgentRun {
  id: string;
  traceId: string;
  agent: "CONVERSATION" | "SAFETY" | "REFILL" | "ACTION";
  status: AgentStatus;
  durationMs: number;
  startedAt: string;
  completedAt?: string;
  summary: string;
  steps: { name: string; detail: string; status: "PASS" | "FAIL" | "INFO" }[];
}

export interface AuditEntry {
  id: string;
  traceId: string;
  action: string;
  actor: string;
  role: string;
  entity: string;
  timestamp: string;
  detail: string;
}

export interface Policy {
  id: string;
  medicineId: string;
  medicineName: string;
  saleAllowed: boolean;
  rxRequired: boolean;
  restricted: boolean;
  maxQty: number;
  minAge: number;
  humanReview: boolean;
  jurisdiction: string;
  updatedAt: string;
  updatedBy: string;
}

export interface InventoryItem {
  id: string;
  medicineId: string;
  medicineName: string;
  strength: string;
  stock: number;
  reserved: number;
  available: number;
  level: InventoryLevel;
  lowStockThreshold: number;
  location: string;
  expiry: string;
  updatedAt: string;
}

export interface Procurement {
  id: string;
  medicineName: string;
  supplier: string;
  quantity: number;
  status: ProcurementStatus;
  requestedAt: string;
  completedAt?: string;
  note?: string;
}
