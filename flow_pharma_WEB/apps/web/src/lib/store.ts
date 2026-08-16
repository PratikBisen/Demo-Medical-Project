/**
 * Flow Pharma - Global Application State & Seed Data Store
 * Provides offline-first interactive data, real multi-agent simulation,
 * local storage persistence, and API connectors.
 */
import { Language } from "./i18n";

export interface DemoUser {
  id: number;
  email: string;
  fullName: string;
  role: "CUSTOMER" | "SELLER" | "SUPER_ADMIN" | "PHARMACIST_REVIEWER";
  language: Language;
  theme: "light" | "dark" | "system";
  phone: string;
}

export interface MedicineItem {
  id: number;
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  category: string;
  schedule: string;
  unitPriceCents: number;
  inStock: number;
  rxRequired: boolean;
  saleAllowed: boolean;
  restricted: boolean;
  maxQty: number;
  description: string;
  aliases: string[];
}

export interface OrderRecord {
  id: number;
  uuid: string;
  customerId: number;
  customerName: string;
  medicineName: string;
  strength: string;
  quantity: number;
  totalPriceCents: number;
  status: "APPROVED" | "PROCESSING" | "DISPATCHED" | "DELIVERED" | "NEEDS_REVIEW" | "BLOCKED";
  rxRequired: boolean;
  rxProvided: boolean;
  createdAt: string;
  deliveryAddress: string;
  sellerName: string;
  timeline: { title: string; time: string; completed: boolean }[];
}

export interface RefillRecord {
  id: number;
  medicineId: number;
  medicineName: string;
  quantityUnits: number;
  dailyDosage: number;
  daysSupply: number;
  estimatedDepletionDate: string;
  reminderDate: string;
  confidence: "HIGH" | "MEDIUM" | "LOW_CONFIDENCE";
  acknowledged: boolean;
  daysRemaining: number;
}

export interface CalendarEventItem {
  id: number;
  title: string;
  type: "REFILL" | "MEDICATION" | "PRESCRIPTION_EXPIRY";
  date: string;
  time: string;
  medicineName: string;
  status: "SCHEDULED" | "COMPLETED";
}

export interface SafetyDecisionRecord {
  id: number;
  traceId: string;
  medicineName: string;
  decision: "APPROVED" | "BLOCKED" | "NEEDS_REVIEW";
  reason: string;
  policyVersion: number;
  checks: { name: string; passed: boolean; details: string }[];
  timestamp: string;
}

export interface AgentTraceItem {
  agent: string;
  status: "COMPLETED" | "APPROVED" | "BLOCKED" | "NEEDS_REVIEW" | "RUNNING";
  durationMs: number;
  summary: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  language: Language;
  matchedMedicine?: MedicineItem;
  safetyDecision?: SafetyDecisionRecord;
  orderCreated?: OrderRecord;
  refillPrediction?: RefillRecord;
  agentTraces?: AgentTraceItem[];
  clarificationOptions?: string[];
}

// Master Medicines Database
export const initialMedicines: MedicineItem[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    genericName: "Paracetamol / Acetaminophen",
    brandName: "Crocin / Calpol",
    strength: "500mg",
    dosageForm: "Tablet",
    category: "Analgesic & Antipyretic",
    schedule: "OTC",
    unitPriceCents: 2500,
    inStock: 250,
    rxRequired: false,
    saleAllowed: true,
    restricted: false,
    maxQty: 10,
    description: "Fast fever and pain relief medication.",
    aliases: ["Crocin", "Calpol", "Dolo 500", "बुखार की दवा", "तापाची गोळी"],
  },
  {
    id: 2,
    name: "Dolo 650mg",
    genericName: "Paracetamol",
    brandName: "Dolo 650",
    strength: "650mg",
    dosageForm: "Tablet",
    category: "Analgesic & Antipyretic",
    schedule: "OTC",
    unitPriceCents: 3200,
    inStock: 180,
    rxRequired: false,
    saleAllowed: true,
    restricted: false,
    maxQty: 10,
    description: "Headache, body pain, and fever reducer.",
    aliases: ["Dolo", "डोलो", "डोलो ६५०"],
  },
  {
    id: 3,
    name: "Telmisartan 40mg",
    genericName: "Telmisartan",
    brandName: "Telma 40",
    strength: "40mg",
    dosageForm: "Tablet",
    category: "Cardiovascular (Antihypertensive)",
    schedule: "Schedule H",
    unitPriceCents: 14500,
    inStock: 90,
    rxRequired: true,
    saleAllowed: true,
    restricted: false,
    maxQty: 6,
    description: "Blood pressure regulation for essential hypertension.",
    aliases: ["Telma 40", "BP Medicine", "Blood pressure", "बीपी की दवा", "रक्तदाबाची औषधं"],
  },
  {
    id: 4,
    name: "Metformin 500mg",
    genericName: "Metformin Hydrochloride",
    brandName: "Glycomet 500",
    strength: "500mg",
    dosageForm: "Tablet",
    category: "Antidiabetic",
    schedule: "Schedule H",
    unitPriceCents: 5500,
    inStock: 120,
    rxRequired: true,
    saleAllowed: true,
    restricted: false,
    maxQty: 8,
    description: "Type 2 diabetes blood glucose management.",
    aliases: ["Glycomet 500", "Sugar Medicine", "Diabetes medicine", "शुगर की दवा", "मधुमेहाचे औषध"],
  },
  {
    id: 5,
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    brandName: "Mox 500",
    strength: "500mg",
    dosageForm: "Capsule",
    category: "Antibiotic",
    schedule: "Schedule H1",
    unitPriceCents: 11500,
    inStock: 60,
    rxRequired: true,
    saleAllowed: true,
    restricted: false,
    maxQty: 3,
    description: "Broad-spectrum antibacterial medication.",
    aliases: ["Mox 500", "Novamox", "Antibiotic"],
  },
  {
    id: 6,
    name: "Cetirizine 10mg",
    genericName: "Cetirizine HCl",
    brandName: "Cetzine",
    strength: "10mg",
    dosageForm: "Tablet",
    category: "Antihistamine / Antiallergy",
    schedule: "OTC",
    unitPriceCents: 2800,
    inStock: 200,
    rxRequired: false,
    saleAllowed: true,
    restricted: false,
    maxQty: 5,
    description: "Relief from allergic rhinitis and sneezing.",
    aliases: ["Cetzine", "Alerid", "एलर्जी की दवा"],
  },
  {
    id: 7,
    name: "Ascoril D Plus Cough Syrup",
    genericName: "Dextromethorphan + Phenylephrine",
    brandName: "Ascoril D Plus",
    strength: "100ml",
    dosageForm: "Syrup",
    category: "Cough & Cold",
    schedule: "OTC",
    unitPriceCents: 11800,
    inStock: 40,
    rxRequired: false,
    saleAllowed: true,
    restricted: false,
    maxQty: 3,
    description: "Sugar-free relief from dry coughing and congestion.",
    aliases: ["Ascoril", "Cough syrup", "Benadryl", "खोकल्याचे सिरप", "खांसी का सिरप"],
  },
  {
    id: 8,
    name: "Tramadol 50mg",
    genericName: "Tramadol HCl",
    brandName: "Tramazac 50",
    strength: "50mg",
    dosageForm: "Capsule",
    category: "Restricted Opioid Analgesic",
    schedule: "Schedule H1",
    unitPriceCents: 19000,
    inStock: 25,
    rxRequired: true,
    saleAllowed: true,
    restricted: true, // triggers NEEDS_REVIEW
    maxQty: 1,
    description: "Restricted narcotic analgesic requiring licensed pharmacist sign-off.",
    aliases: ["Tramadol", "Tramazac"],
  },
  {
    id: 9,
    name: "Ephedrine Hydrochloride 30mg",
    genericName: "Ephedrine HCl",
    brandName: "Ephedrine",
    strength: "30mg",
    dosageForm: "Tablet",
    category: "Prohibited Sympathomimetic",
    schedule: "Schedule X",
    unitPriceCents: 5000,
    inStock: 0,
    rxRequired: true,
    saleAllowed: false, // triggers BLOCKED
    restricted: true,
    maxQty: 0,
    description: "Prohibited under jurisdiction narcotics regulations.",
    aliases: ["Ephedrine"],
  },
  {
    id: 10,
    name: "Salbutamol Inhaler 100mcg",
    genericName: "Salbutamol / Albuterol",
    brandName: "Asthalin",
    strength: "100mcg",
    dosageForm: "Inhaler",
    category: "Respiratory",
    schedule: "Schedule H",
    unitPriceCents: 16500,
    inStock: 0, // OUT OF STOCK DEMO
    rxRequired: true,
    saleAllowed: true,
    restricted: false,
    maxQty: 2,
    description: "Bronchodilator for asthma relief.",
    aliases: ["Asthalin", "Inhaler"],
  },
];

// Initial Demo Users
export const demoUsers: DemoUser[] = [
  {
    id: 1,
    email: "customer@flowpharma.local",
    fullName: "Rahul Sharma",
    role: "CUSTOMER",
    language: "en",
    theme: "dark",
    phone: "+91 98765 43210",
  },
  {
    id: 2,
    email: "seller@flowpharma.local",
    fullName: "Dr. Vikram Patel",
    role: "SELLER",
    language: "en",
    theme: "dark",
    phone: "+91 98220 33445",
  },
  {
    id: 3,
    email: "admin@flowpharma.local",
    fullName: "Super Administrator",
    role: "SUPER_ADMIN",
    language: "en",
    theme: "dark",
    phone: "+91 99000 11000",
  },
  {
    id: 4,
    email: "pharmacist@flowpharma.local",
    fullName: "Dr. Pooja Mehta (R.Ph)",
    role: "PHARMACIST_REVIEWER",
    language: "en",
    theme: "dark",
    phone: "+91 99000 22000",
  },
];

// Initial Orders
export const initialOrders: OrderRecord[] = [
  {
    id: 101,
    uuid: "ord-883910-a",
    customerId: 1,
    customerName: "Rahul Sharma",
    medicineName: "Telmisartan 40mg",
    strength: "40mg",
    quantity: 1,
    totalPriceCents: 14500,
    status: "DELIVERED",
    rxRequired: true,
    rxProvided: true,
    createdAt: "2026-08-01T10:15:00Z",
    deliveryAddress: "402 Palm Heights, Powai, Mumbai 400076",
    sellerName: "Apex City Chemist & Care",
    timeline: [
      { title: "Request Received", time: "10:15 AM", completed: true },
      { title: "Medicine Identified", time: "10:15 AM", completed: true },
      { title: "Safety Check Passed", time: "10:16 AM", completed: true },
      { title: "Prescription Verified", time: "10:18 AM", completed: true },
      { title: "Inventory Reserved", time: "10:19 AM", completed: true },
      { title: "Order Dispatched", time: "11:30 AM", completed: true },
      { title: "Delivered", time: "02:45 PM", completed: true },
    ],
  },
  {
    id: 102,
    uuid: "ord-883911-b",
    customerId: 1,
    customerName: "Rahul Sharma",
    medicineName: "Metformin 500mg",
    strength: "500mg",
    quantity: 1,
    totalPriceCents: 5500,
    status: "DELIVERED",
    rxRequired: true,
    rxProvided: true,
    createdAt: "2026-08-01T10:15:00Z",
    deliveryAddress: "402 Palm Heights, Powai, Mumbai 400076",
    sellerName: "Apex City Chemist & Care",
    timeline: [
      { title: "Request Received", time: "10:15 AM", completed: true },
      { title: "Safety Check Passed", time: "10:16 AM", completed: true },
      { title: "Delivered", time: "02:45 PM", completed: true },
    ],
  },
];

// Initial Refills
export const initialRefills: RefillRecord[] = [
  {
    id: 1,
    medicineId: 3,
    medicineName: "Telmisartan 40mg",
    quantityUnits: 30,
    dailyDosage: 1.0,
    daysSupply: 30,
    estimatedDepletionDate: "2026-08-19",
    reminderDate: "2026-08-15",
    confidence: "HIGH",
    acknowledged: false,
    daysRemaining: 4,
  },
  {
    id: 2,
    medicineId: 4,
    medicineName: "Metformin 500mg",
    quantityUnits: 60,
    dailyDosage: 2.0,
    daysSupply: 30,
    estimatedDepletionDate: "2026-08-19",
    reminderDate: "2026-08-15",
    confidence: "HIGH",
    acknowledged: false,
    daysRemaining: 4,
  },
];

// Initial Calendar Events
export const initialEvents: CalendarEventItem[] = [
  {
    id: 1,
    title: "Refill Due: Telmisartan 40mg",
    type: "REFILL",
    date: "2026-08-16",
    time: "08:30 AM",
    medicineName: "Telmisartan 40mg",
    status: "SCHEDULED",
  },
  {
    id: 2,
    title: "Morning Dose: Metformin 500mg",
    type: "MEDICATION",
    date: "2026-08-15",
    time: "09:00 AM",
    medicineName: "Metformin 500mg",
    status: "COMPLETED",
  },
  {
    id: 3,
    title: "Night Dose: Metformin 500mg",
    type: "MEDICATION",
    date: "2026-08-15",
    time: "09:00 PM",
    medicineName: "Metformin 500mg",
    status: "SCHEDULED",
  },
  {
    id: 4,
    title: "Prescription Expiry Notice: Dr. Anand Rao Rx",
    type: "PRESCRIPTION_EXPIRY",
    date: "2026-09-30",
    time: "10:00 AM",
    medicineName: "Cardiology Prescription",
    status: "SCHEDULED",
  },
];

// Initial Safety Decisions
export const initialSafetyDecisions: SafetyDecisionRecord[] = [
  {
    id: 1,
    traceId: "tr-seed-001",
    medicineName: "Telmisartan 40mg",
    decision: "APPROVED",
    reason: "All deterministic safety, valid prescription, and inventory checks verified.",
    policyVersion: 1,
    checks: [
      { name: "Medicine Active", passed: true, details: "Active in CDSCO catalog" },
      { name: "Sale Policy", passed: true, details: "Permitted in India jurisdiction" },
      { name: "Prescription Check", passed: true, details: "Verified Rx on file (Dr. Anand Rao)" },
      { name: "Stock Available", passed: true, details: "90 units in stock" },
      { name: "Max Quantity", passed: true, details: "Requested 1 <= Max 6" },
    ],
    timestamp: "2026-08-15T12:00:00Z",
  },
  {
    id: 2,
    traceId: "tr-seed-002",
    medicineName: "Tramadol 50mg",
    decision: "NEEDS_REVIEW",
    reason: "Schedule H1 restricted narcotic category requires licensed pharmacist sign-off.",
    policyVersion: 1,
    checks: [
      { name: "Medicine Active", passed: true, details: "Active in catalog" },
      { name: "Restricted Category", passed: false, details: "Schedule H1 Opioid flag triggered" },
      { name: "Human Review Required", passed: false, details: "Mandatory review queue" },
    ],
    timestamp: "2026-08-15T13:30:00Z",
  },
  {
    id: 3,
    traceId: "tr-seed-003",
    medicineName: "Ephedrine Hydrochloride 30mg",
    decision: "BLOCKED",
    reason: "Sale prohibited under configured jurisdiction policy (Schedule X restriction).",
    policyVersion: 1,
    checks: [
      { name: "Sale Allowed", passed: false, details: "Policy flag sale_allowed = False" },
    ],
    timestamp: "2026-08-15T14:10:00Z",
  },
];
