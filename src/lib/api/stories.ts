import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
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

/** Same URL for POST (create) and PATCH (update) — the server reads body.id. */
const CREATE_PATH = "/stories/create";

export const storiesApi = {
  list(filters: StoryListFilters, opts?: ClientOptions) {
    return api.get<StoryListResponse>("/stories", {
      params: { ...filters },
      signal: opts?.signal,
    });
  },

  bySlug(slug: string, opts?: ClientOptions) {
    return api.get<{ story: StoryDTO }>(
      `/stories/${encodeURIComponent(slug)}`,
      { signal: opts?.signal }
    );
  },

  /** Today's page treats every related failure as an empty list — preserved. */
  async related(slug: string, opts?: ClientOptions): Promise<StoryListResponse> {
    try {
      return await api.get<StoryListResponse>(
        `/stories/related/${encodeURIComponent(slug)}`,
        { signal: opts?.signal }
      );
    } catch {
      return { stories: [] };
    }
  },

  /** Editor draft: GET /stories/create?id=<storyId> (server supports GET here). */
  draft(id: string, opts?: ClientOptions) {
    return api.get<{ story: StoryDTO }>(CREATE_PATH, {
      params: { id },
      signal: opts?.signal,
    });
  },

  like(storyId: string) {
    return api.post<StoryLikeResponse>("/stories/like", { storyId });
  },

  bookmark(storyId: string) {
    return api.post<StoryBookmarkResponse>("/stories/bookmark", { storyId });
  },

  create(payload: CreateOrUpdateStoryPayload, opts?: ClientOptions) {
    return api.post<{ story: StoryDTO }>(CREATE_PATH, payload, opts);
  },

  update(payload: CreateOrUpdateStoryPayload, opts?: ClientOptions) {
    return api.patch<{ story: StoryDTO }>(CREATE_PATH, payload, opts);
  },
};

export const storyQueries = {
  list(filters: StoryListFilters, enabled = true) {
    return {
      queryKey: queryKeys.stories.list(filters),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        storiesApi.list(filters, { signal: ctx.signal }),
      enabled,
    };
  },
  detail(slug: string) {
    return {
      queryKey: queryKeys.stories.detail(slug),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        storiesApi.bySlug(slug, { signal: ctx.signal }),
      retry: false as const,
    };
  },
  related(slug: string) {
    return {
      queryKey: queryKeys.stories.related(slug),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        storiesApi.related(slug, { signal: ctx.signal }),
    };
  },
  draft(editId: string | null) {
    return {
      queryKey: queryKeys.stories.draft(editId ?? ""),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        storiesApi.draft(editId ?? "", { signal: ctx.signal }),
      enabled: !!editId,
      retry: false as const,
    };
  },
};
