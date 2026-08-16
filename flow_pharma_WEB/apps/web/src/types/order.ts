import type { OrderStatus, OrderStage } from "./common";

export interface OrderTimelineStep {
  key: string;
  label: string;
  time?: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  medicineId: string;
  medicineName: string;
  strength: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: OrderStatus;
  stage: OrderStage;
  rxRequired: boolean;
  rxProvided: boolean;
  createdAt: string;
  updatedAt: string;
  sellerName: string;
  deliveryAddress: string;
  traceId: string;
  customerSafeId: string;
  timeline: OrderTimelineStep[];
}

export interface CreateOrderRequest {
  medicineId: string;
  quantity: number;
  deliveryAddress?: string;
  rxProvided?: boolean;
}

export interface OrderFilters {
  stage?: OrderStage;
  query?: string;
}
