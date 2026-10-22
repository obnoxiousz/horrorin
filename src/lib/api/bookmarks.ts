import { api, type ClientOptions } from "./client";
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
