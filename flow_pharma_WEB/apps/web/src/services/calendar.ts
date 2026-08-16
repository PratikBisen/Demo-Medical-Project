import { apiRequest, ApiError, ApiCodes } from "./http";
import { getDb } from "@/mocks/store";
import type { CalendarEvent } from "@/types/domain";
import { uid, nowIso, todayISO } from "@/lib/utils";

export const calendarService = {
  list(month?: string): Promise<CalendarEvent[]> {
    return apiRequest({
      url: "/api/v1/calendar",
      mock: async () => {
        let events = getDb().get("events");
        if (month) {
          events = events.filter((e) => e.date.startsWith(month));
        }
        return [...events].sort((a, b) => a.date.localeCompare(b.date));
      },
    });
  },

  upcoming(limit = 8): Promise<CalendarEvent[]> {
    return apiRequest({
      url: "/api/v1/calendar/upcoming",
      mock: async () => {
        const today = todayISO();
        return getDb()
          .get("events")
          .filter((e) => e.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, limit);
      },
    });
  },

  add(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
    return apiRequest({
      url: "/api/v1/calendar",
      method: "POST",
      body: event,
      mock: async () => {
        const created: CalendarEvent = { ...event, id: `ev-${uid("n")}` };
        getDb().update("events", (events) => [...events, created]);
        return created;
      },
    });
  },

  complete(id: string): Promise<CalendarEvent> {
    return apiRequest({
      url: `/api/v1/calendar/${id}/complete`,
      method: "PATCH",
      mock: async () => {
        let done: CalendarEvent | null = null;
        getDb().update("events", (events) =>
          events.map((e) => {
            if (e.id !== id) return e;
            done = { ...e, status: "COMPLETED" };
            return done;
          }),
        );
        if (!done) throw new ApiError(ApiCodes.NOT_FOUND, "Event not found.");
        return done;
      },
    });
  },
};

export const refillsService = {
  list(): Promise<import("@/types/domain").Refill[]> {
    return apiRequest({
      url: "/api/v1/refills",
      mock: async () => getDb().get("refills"),
    });
  },

  dismiss(id: string): Promise<import("@/types/domain").Refill> {
    return apiRequest({
      url: `/api/v1/refills/${id}/dismiss`,
      method: "PATCH",
      mock: async () => {
        let done: import("@/types/domain").Refill | null = null;
        getDb().update("refills", (items) =>
          items.map((r) => {
            if (r.id !== id) return r;
            done = { ...r, status: "DISMISSED" };
            return done;
          }),
        );
        if (!done) throw new ApiError(ApiCodes.NOT_FOUND, "Refill not found.");
        return done;
      },
    });
  },
};

export const prescriptionsService = {
  list(): Promise<import("@/types/domain").Prescription[]> {
    return apiRequest({
      url: "/api/v1/prescriptions",
      mock: async () => getDb().get("prescriptions"),
    });
  },

  upload(file: { name: string; size: number; type: string }): Promise<import("@/types/domain").Prescription> {
    return apiRequest({
      url: "/api/v1/prescriptions",
      method: "POST",
      body: file,
      mock: async () => {
        const created: import("@/types/domain").Prescription = {
          id: `rx-${uid("n")}`,
          doctorName: "To be verified",
          clinic: "Uploaded file",
          medicines: [],
          status: "PENDING",
          issuedAt: nowIso(),
          file,
          traceId: `tr-${uid("rx")}`,
        };
        getDb().update("prescriptions", (items) => [created, ...items]);
        return created;
      },
    });
  },
};

export const notificationsService = {
  list(): Promise<import("@/types/domain").AppNotification[]> {
    return apiRequest({
      url: "/api/v1/notifications",
      mock: async () =>
        [...getDb().get("notifications")].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  },

  markAllRead(): Promise<void> {
    return apiRequest({
      url: "/api/v1/notifications/read-all",
      method: "PATCH",
      mock: async () => {
        getDb().update("notifications", (items) => items.map((n) => ({ ...n, read: true })));
      },
    });
  },

  unreadCount(): Promise<number> {
    return apiRequest({
      url: "/api/v1/notifications/unread",
      mock: async () => getDb().get("notifications").filter((n) => !n.read).length,
    });
  },
};
