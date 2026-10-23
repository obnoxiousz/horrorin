import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import { queryOptions } from "@tanstack/react-query";
import type { CategoryWithCount, StoryListItem } from "@/types";

export interface HomeCreator {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  storyCount: number;
  totalLikes: number;
}

export interface HomeResponse {
  latest: StoryListItem[];
  trending: StoryListItem[];
  recommended: StoryListItem[];
  categories: CategoryWithCount[];
  creators: HomeCreator[];
}

export const homeApi = {
  all(opts?: ClientOptions) {
    return api.get<HomeResponse>("/public/home", { signal: opts?.signal });
  },
};

export const homeQueries = {
  all() {
    return queryOptions({
      queryKey: queryKeys.home.all,
      queryFn: (ctx: { signal?: AbortSignal }) =>
        homeApi.all({ signal: ctx.signal }),
      // Landing payload ages slowly; like/bookmark/comment actions invalidate
      // this key explicitly (see story-card / detail page).
      staleTime: 2 * 60_000,
    });
  },
};
