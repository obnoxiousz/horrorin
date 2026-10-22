import { api } from "./client";
import type { NotificationDTO } from "@/types";

export interface NotificationsListResponse {
  notifications: NotificationDTO[];
  unread: number;
}

export const notificationsApi = {
  list() {
    return api.get<NotificationsListResponse>("/notifications");
  },

  /** Matches the mark-all call (body {}) and the ids variant of the route. */
  markRead(ids?: string[]) {
    return api.post<{ ok: boolean }>("/notifications/read", ids ? { ids } : {});
  },
};
