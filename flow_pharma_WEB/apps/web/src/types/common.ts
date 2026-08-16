export type Language = "en" | "hi" | "mr";

export type ThemeMode = "light" | "dark" | "system";

export type Role = "CUSTOMER" | "SELLER" | "SUPER_ADMIN" | "PHARMACIST_REVIEWER";

export type AccountType = "CUSTOMER" | "SELLER";

export type OrderStatus =
  | "REQUEST_RECEIVED"
  | "MEDICINE_IDENTIFIED"
  | "SAFETY_CHECK"
  | "PRESCRIPTION_REQUIRED"
  | "PRESCRIPTION_VERIFIED"
  | "INVENTORY"
  | "APPROVED"
  | "PROCESSING"
  | "FULFILLMENT"
  | "DELIVERED"
  | "NEEDS_REVIEW"
  | "BLOCKED";

export type OrderStage = "ACTIVE" | "COMPLETED" | "REVIEW" | "BLOCKED";

export type PrescriptionStatus = "PENDING" | "VERIFIED" | "REJECTED" | "NEEDS_REVIEW";

export type Decision = "APPROVED" | "BLOCKED" | "REVIEW";

export type EventType = "REFILL" | "MEDICATION" | "PRESCRIPTION" | "ORDER";

export type RefillStatus = "UPCOMING" | "PREDICTED" | "COMPLETED" | "DISMISSED";

export type RefillConfidence = "HIGH" | "MEDIUM" | "LOW";

export type NotificationType =
  | "REFILL_REMINDER"
  | "ORDER_UPDATE"
  | "PRESCRIPTION_REQUEST"
  | "SAFETY_BLOCK"
  | "REVIEW_REQUEST";

export type AgentStatus = "RUNNING" | "COMPLETED" | "WAITING" | "ERROR" | "REVIEW";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type ProcurementStatus = "REQUESTED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type InventoryLevel = "AVAILABLE" | "RESERVED" | "LOW" | "OUT";
