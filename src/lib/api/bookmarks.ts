import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import { queryOptions } from "@tanstack/react-query";
import type { StoryListItem } from "@/types";

export interface BookmarksResponse {
  bookmarks: StoryListItem[];
}

export const bookmarksApi = {
  list(opts?: ClientOptions) {
    return api.get<BookmarksResponse>("/public/stories/bookmark/list", {
      signal: opts?.signal,
    });
  },
};

export const bookmarkQueries = {
  list(enabled: boolean) {
    return queryOptions({
      queryKey: queryKeys.bookmarks.list(),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        bookmarksApi.list({ signal: ctx.signal }),
      enabled,
    });
  },
};
