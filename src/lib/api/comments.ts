import { api, ApiError, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import { queryOptions } from "@tanstack/react-query";
import type { CommentDTO } from "@/types";

export interface CommentsListResponse {
  comments: CommentDTO[];
}

export type CommentCreatePayload = {
  storyId: string;
  content: string;
  parentId?: string | null;
};

export const commentsApi = {
  /** The page stays silent on failed loads — aborts/network rethrow (was !r.ok). */
  async byStory(
    storyId: string,
    opts?: ClientOptions
  ): Promise<CommentsListResponse> {
    try {
      return await api.get<CommentsListResponse>(
        `/public/comments/${encodeURIComponent(storyId)}`,
        { signal: opts?.signal }
      );
    } catch (e) {
      if (e instanceof ApiError) return { comments: [] };
      throw e;
    }
  },

  create(payload: CommentCreatePayload) {
    return api.post<{ comment: CommentDTO }>("/public/comments", payload);
  },
};

export const commentQueries = {
  byStory(storyId: string) {
    return queryOptions({
      queryKey: queryKeys.comments.byStory(storyId),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        commentsApi.byStory(storyId, { signal: ctx.signal }),
      enabled: !!storyId,
    });
  },
};
