"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicinesService } from "@/services/medicines";
import { ordersService, evaluateOrder, type OrderProposal } from "@/services/orders";
import { calendarService, refillsService, prescriptionsService, notificationsService } from "@/services/calendar";
import { sellersService, adminService } from "@/services/sellers";
import { authService } from "@/services/auth";
import { computeSellerAnalytics, computeAdminAnalytics } from "@/services/analytics";

export function useMedicines() {
  return useQuery({ queryKey: ["medicines"], queryFn: medicinesService.list });
}

export function useMedicine(id: string | undefined) {
  return useQuery({
    queryKey: ["medicines", id],
    queryFn: () => medicinesService.get(id!),
    enabled: !!id,
  });
}

export function useOrders() {
  return useQuery({ queryKey: ["orders"], queryFn: () => ordersService.list() });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersService.get(id!),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: { medicineId: string; quantity: number; rxProvided?: boolean }) =>
      ordersService.create(req),
    onSuccess: (proposal: OrderProposal) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["medicines"] });
      void proposal;
    },
  });
}

export function useAdvanceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersService.advance(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useEvents(month?: string) {
  return useQuery({ queryKey: ["events", month ?? "all"], queryFn: () => calendarService.list(month) });
}

export function useUpcomingEvents(limit = 8) {
  return useQuery({ queryKey: ["events-upcoming"], queryFn: () => calendarService.upcoming(limit) });
}

export function useCompleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarService.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useRefills() {
  return useQuery({ queryKey: ["refills"], queryFn: refillsService.list });
}

export function useDismissRefill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => refillsService.dismiss(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["refills"] }),
  });
}

export function usePrescriptions() {
  return useQuery({ queryKey: ["prescriptions"], queryFn: prescriptionsService.list });
}

export function useUploadPrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: { name: string; size: number; type: string }) => prescriptionsService.upload(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prescriptions"] }),
  });
}

export function useNotifications() {
  return useQuery({ queryKey: ["notifications"], queryFn: notificationsService.list });
}

export function useUnreadCount() {
  return useQuery({ queryKey: ["unread"], queryFn: notificationsService.unreadCount });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread"] });
    },
  });
}

export function useCurrentUser() {
  return useQuery({ queryKey: ["me"], queryFn: async () => authService.current() });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof authService.updateProfile>[0]) => authService.updateProfile(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useSellerOrders() {
  return useQuery({ queryKey: ["seller-orders"], queryFn: sellersService.orders });
}

export function useSellerQueue() {
  return useQuery({ queryKey: ["seller-queue"], queryFn: sellersService.queue });
}

export function useAdvanceQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellersService.advanceQueue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-queue"] });
      qc.invalidateQueries({ queryKey: ["seller-analytics"] });
    },
  });
}

export function useSellerInventory() {
  return useQuery({ queryKey: ["seller-inventory"], queryFn: sellersService.inventory });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => sellersService.updateStock(id, stock),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-inventory"] });
      qc.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}

export function useProcurement() {
  return useQuery({ queryKey: ["procurement"], queryFn: sellersService.procurement });
}

export function useRequestProcurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: { medicineName: string; quantity: number; supplier: string }) =>
      sellersService.requestProcurement(req.medicineName, req.quantity, req.supplier),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["procurement"] }),
  });
}

export function useAdminMedicines() {
  return useQuery({ queryKey: ["admin-medicines"], queryFn: adminService.medicines });
}

export function useAdminPolicies() {
  return useQuery({ queryKey: ["admin-policies"], queryFn: adminService.policies });
}

export function useUpdatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      adminService.updatePolicy(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-policies"] });
      qc.invalidateQueries({ queryKey: ["admin-medicines"] });
    },
  });
}

export function useAdminReviews() {
  return useQuery({ queryKey: ["admin-reviews"], queryFn: adminService.reviews });
}

export function useAdminAgents() {
  return useQuery({ queryKey: ["admin-agents"], queryFn: adminService.agents });
}

export function useAdminAudit() {
  return useQuery({ queryKey: ["admin-audit"], queryFn: adminService.audit });
}

export function useAdminUsers() {
  return useQuery({ queryKey: ["admin-users"], queryFn: adminService.users });
}

export function useAdminOrders() {
  return useQuery({ queryKey: ["admin-orders"], queryFn: adminService.orders });
}

export function useAdminInventory() {
  return useQuery({ queryKey: ["admin-inventory"], queryFn: adminService.inventory });
}

export function useAdminPrescriptions() {
  return useQuery({ queryKey: ["admin-prescriptions"], queryFn: adminService.prescriptions });
}

export function useAdminRefills() {
  return useQuery({ queryKey: ["admin-refills"], queryFn: adminService.refills });
}

export function useSellerAnalytics() {
  return useQuery({ queryKey: ["seller-analytics"], queryFn: computeSellerAnalytics });
}

export function useAdminAnalytics() {
  return useQuery({ queryKey: ["admin-analytics"], queryFn: computeAdminAnalytics });
}
