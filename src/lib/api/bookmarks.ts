import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import type { StoryListItem } from "@/types";

export interface BookmarkListResponse {
  bookmarks: StoryListItem[];
}

export const bookmarksApi = {
  list(opts?: ClientOptions) {
    return api.get<BookmarkListResponse>("/stories/bookmark/list", {
      signal: opts?.signal,
    });
  },
};

export const bookmarkQueries = {
  list(enabled = true) {
    return {
      queryKey: queryKeys.bookmarks.all,
      queryFn: (ctx: { signal?: AbortSignal }) =>
        bookmarksApi.list({ signal: ctx.signal }),
      enabled,
    };
  },
};
