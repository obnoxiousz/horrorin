import { api, ApiError, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import { queryOptions } from "@tanstack/react-query";
import type { CommentDTO } from "@/types";

export interface CommentsListResponse {
  comments: CommentDTO[];
}

export const commentsApi = {
  /** Parallel variant used on the detail page so comments race the story fetch. */
  async bySlug(slug: string, opts?: ClientOptions): Promise<CommentsListResponse> {
    try {
      return await api.get<CommentsListResponse>("/public/comments", {
        params: { slug },
        signal: opts?.signal,
      });
    } catch (e) {
      if (e instanceof ApiError) return { comments: [] };
      throw e;
    }
  },

  create(storyId: string, payload: { content: string; parentId?: string }) {
    return api.post<{ comment: CommentDTO }>(
      `/public/comments/${encodeURIComponent(storyId)}`,
      payload
    );
  },
};

export const commentQueries = {
  bySlug(slug: string) {
    return queryOptions({
      queryKey: queryKeys.comments.bySlug(slug),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        commentsApi.bySlug(slug, { signal: ctx.signal }),
    });
  },
};
