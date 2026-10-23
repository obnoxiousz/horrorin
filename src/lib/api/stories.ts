import { api, ApiError, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import { queryOptions } from "@tanstack/react-query";
import type { StoryDTO, StoryListItem } from "@/types";

export type StoryListFilters = {
  sort?: "latest" | "trending" | "recommended";
  take?: number;
  category?: string;
  tag?: string;
  q?: string;
};

export interface StoryListResponse {
  stories: StoryListItem[];
}

export interface StoryLikeResponse {
  liked: boolean;
}

export interface StoryBookmarkResponse {
  bookmarked: boolean;
}

export interface MyStoriesResponse {
  stories: StoryListItem[];
}

export interface CreateOrUpdateStoryPayload {
  id?: string;
  title: string;
  excerpt: string | null;
  categoryId: string;
  templateId?: string | null;
  templateSlug?: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  blocks: { type: string; data: unknown; order: number }[];
}

export const storiesApi = {
  list(filters: StoryListFilters, opts?: ClientOptions) {
    return api.get<StoryListResponse>("/public/stories", {
      params: { ...filters },
      signal: opts?.signal,
    });
  },

  bySlug(slug: string, opts?: ClientOptions) {
    return api.get<{ story: StoryDTO }>(
      `/public/stories/${encodeURIComponent(slug)}`,
      { signal: opts?.signal }
    );
  },

  /** The page treats only failed responses as an empty list —
   *  aborts and network errors rethrow (matches today's !r.ok branch). */
  async related(slug: string, opts?: ClientOptions): Promise<StoryListResponse> {
    try {
      return await api.get<StoryListResponse>(
        `/public/stories/related/${encodeURIComponent(slug)}`,
        { signal: opts?.signal }
      );
    } catch (e) {
      if (e instanceof ApiError) return { stories: [] };
      throw e;
    }
  },

  /** Editor draft: GET /public/stories/create?id=<storyId> (server supports GET here). */
  draft(id: string, opts?: ClientOptions) {
    return api.get<{ story: StoryDTO }>("/public/stories/create", {
      params: { id },
      signal: opts?.signal,
    });
  },

  /** /stories/me — own stories (profile draft tab). Failed responses behave like !r.ok today. */
  async mine(opts?: ClientOptions): Promise<MyStoriesResponse> {
    try {
      return await api.get<MyStoriesResponse>("/public/stories/me", {
        signal: opts?.signal,
      });
    } catch (e) {
      if (e instanceof ApiError) return { stories: [] };
      throw e;
    }
  },

  like(storyId: string) {
    return api.post<StoryLikeResponse>("/public/stories/like", { storyId });
  },

  bookmark(storyId: string) {
    return api.post<StoryBookmarkResponse>("/public/stories/bookmark", { storyId });
  },

  create(payload: CreateOrUpdateStoryPayload, opts?: ClientOptions) {
    return api.post<{ story: StoryDTO }>("/public/stories/create", payload, opts);
  },

  /** Same URL as create — the server reads body.id here. */
  update(payload: CreateOrUpdateStoryPayload, opts?: ClientOptions) {
    return api.patch<{ story: StoryDTO }>("/public/stories/create", payload, opts);
  },
};

export const storyQueries = {
  list(filters: StoryListFilters, enabled = true) {
    return queryOptions({
      queryKey: queryKeys.stories.list(filters),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        storiesApi.list(filters, { signal: ctx.signal }),
      enabled,
      // Published lists change slowly; mutations invalidate this key precisely
      // (story-card, detail page, editor save).
      staleTime: 2 * 60_000,
    });
  },
  detail(slug: string) {
    return queryOptions({
      queryKey: queryKeys.stories.detail(slug),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        storiesApi.bySlug(slug, { signal: ctx.signal }),
      retry: false as const,
      staleTime: 2 * 60_000,
    });
  },
  related(slug: string) {
    return queryOptions({
      queryKey: queryKeys.stories.related(slug),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        storiesApi.related(slug, { signal: ctx.signal }),
      staleTime: 2 * 60_000,
    });
  },
  mine(username: string, enabled: boolean) {
    return queryOptions({
      queryKey: queryKeys.stories.mine(username),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        storiesApi.mine({ signal: ctx.signal }),
      enabled,
    });
  },
  draft(editId: string | null) {
    return queryOptions({
      queryKey: queryKeys.stories.draft(editId ?? ""),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        storiesApi.draft(editId ?? "", { signal: ctx.signal }),
      enabled: !!editId,
      retry: false as const,
    });
  },
};
