import type { Decision } from "./common";

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  category: string;
  schedule: string;
  unitPrice: number;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  rxRequired: boolean;
  saleAllowed: boolean;
  restricted: boolean;
  maxQty: number;
  description: string;
  aliases: string[];
  status: "ACTIVE" | "DISCONTINUED" | "DRAFT";
}

export interface SafetyDecision {
  id: string;
  traceId: string;
  medicineName: string;
  decision: Decision;
  reason: string;
  policyVersion: number;
  checks: { name: string; passed: boolean; details: string }[];
  timestamp: string;
}

export interface MedicineMatch {
  medicine: Medicine;
  confidence: number;
  intent: "ORDER" | "REFILL" | "INFO" | "STOCK_CHECK";
  quantity: number;
}
