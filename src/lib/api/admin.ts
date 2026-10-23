import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import { queryOptions } from "@tanstack/react-query";
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

  stats(opts?: ClientOptions) {
    return api.get<AdminStatsResponse>("/admin/stats", {
      signal: opts?.signal,
    });
  },
};

export interface AdminStatsRecent {
  id: string;
  slug: string;
  title: string;
  status: string;
  createdAt: string;
  author: { id: string; name: string | null; username: string | null; image: string | null } | null;
}

export interface AdminStatsResponse {
  users: number;
  stories: { total: number; published: number; draft: number; archived: number };
  views: number;
  likes: number;
  comments: number;
  recent: AdminStatsRecent[];
}

export const adminQueries = {
  users(search?: string, enabled = true) {
    const normalized = search ?? "";
    return queryOptions({
      queryKey: queryKeys.admin.usersList(normalized),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        adminApi.users(normalized ? { q: normalized } : {}, { signal: ctx.signal }),
      enabled,
    });
  },
  stories(enabled = true) {
    return queryOptions({
      queryKey: queryKeys.admin.stories(),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        adminApi.stories({ signal: ctx.signal }),
      enabled,
    });
  },
  stats(enabled = true) {
    return queryOptions({
      queryKey: queryKeys.admin.stats(),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        adminApi.stats({ signal: ctx.signal }),
      enabled,
    });
  },
};
