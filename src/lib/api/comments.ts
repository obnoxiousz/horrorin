import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import type { CommentDTO } from "@/types";

export interface CommentsListResponse {
  comments: CommentDTO[];
}

export const commentsApi = {
  /** Detail page treats every comments failure as an empty list — preserved. */
  async byStory(
    storyId: string,
    opts?: ClientOptions
  ): Promise<CommentsListResponse> {
    try {
      return await api.get<CommentsListResponse>(
        `/comments/${encodeURIComponent(storyId)}`,
        { signal: opts?.signal }
      );
    } catch {
      return { comments: [] };
    }
  },

  create(
    storyId: string,
    content: string,
    parentId?: string,
    opts?: ClientOptions
  ) {
    return api.post<{ comment: CommentDTO }>(
      `/comments/${encodeURIComponent(storyId)}`,
      { content, ...(parentId !== undefined && { parentId }) },
      opts
    );
  },
};

export const commentQueries = {
  byStory(storyId: string | null | undefined) {
    return {
      queryKey: queryKeys.comments.byStory(storyId ?? ""),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        commentsApi.byStory(storyId ?? "", { signal: ctx.signal }),
      enabled: !!storyId,
    };
  },
};
