import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminStoryRow, AdminUserRow } from "@/types";

export type AdminUserFilters = {
  q?: string;
  take?: number;
};

export interface AdminUpdateUserBody {
  role?: string;
  banned?: boolean;
}

export const adminApi = {
  users(filters: AdminUserFilters = {}, opts?: ClientOptions) {
    return api.get<{ users: AdminUserRow[] }>("/admin/users", {
      params: filters,
      signal: opts?.signal,
    });
  },

  updateUser(id: string, body: AdminUpdateUserBody) {
    return api.patch<{ user: AdminUserRow }>(
      `/admin/users/${encodeURIComponent(id)}`,
      body
    );
  },

  stories(opts?: ClientOptions) {
    return api.get<{ stories: AdminStoryRow[] }>("/admin/stories", {
      signal: opts?.signal,
    });
  },

  setStoryStatus(id: string, status: string) {
    return api.patch<{ story: AdminStoryRow }>(
      `/admin/stories/${encodeURIComponent(id)}`,
      { status }
    );
  },

  deleteStory(id: string) {
    return api.delete<{ ok: boolean }>(`/admin/stories/${encodeURIComponent(id)}`);
  },
};

export const adminQueries = {
  users(search: string, enabled = true) {
    return {
      queryKey: queryKeys.admin.usersList(search),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        adminApi.users(search ? { q: search } : {}, { signal: ctx.signal }),
      enabled,
    };
  },
  stories(enabled = true) {
    return {
      queryKey: queryKeys.admin.stories(),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        adminApi.stories({ signal: ctx.signal }),
      enabled,
    };
  },
};
