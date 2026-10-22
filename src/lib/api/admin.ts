import { api, type ClientOptions } from "./client";
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
