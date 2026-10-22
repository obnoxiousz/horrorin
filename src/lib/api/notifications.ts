import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import { queryOptions } from "@tanstack/react-query";

export interface MyNotificationsResponse {
  notifications: {
    id: string;
    read: boolean;
    createdAt: string;
    actor?: {
      id: string;
      name: string | null;
      image: string | null;
      username: string | null;
    } | null;
    story?:
      | {
          id: string;
          slug: string;
          title: string;
          thumbnailUrl: string | null;
        }
      | null;
    type: string;
  }[];
}

/** The navbar strips query-string ids in use — kept verbatim on the client. */
export const notificationsApi = {
  list(opts?: ClientOptions) {
    return api.get<MyNotificationsResponse>("/public/notifications", {
      signal: opts?.signal,
    });
  },

  markRead(opts?: ClientOptions) {
    return api.patch<{ ok: boolean }>("/public/notifications/read", undefined, opts);
  },
};

export const notificationQueries = {
  list(enabled: boolean) {
    return queryOptions({
      queryKey: queryKeys.notifications.list(),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        notificationsApi.list({ signal: ctx.signal }),
      enabled,
    });
  },
};
