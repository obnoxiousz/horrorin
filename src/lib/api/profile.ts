import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import type { ProfileDTO, StoryListItem } from "@/types";

export interface ProfileByUsernameResponse {
  profile: ProfileDTO;
  stories: StoryListItem[];
}

export interface MyStoriesResponse {
  stories: StoryListItem[];
}

export interface FollowResult {
  following: boolean;
}

export interface UpdateProfileBody {
  name?: string;
  bio?: string | null;
  image?: string | null;
  username?: string;
}

/** Response is a superset (profile relation included); callers ignore it. */
export type UpdateProfileResponse = { user: ProfileDTO };

export const profileApi = {
  get(username: string, opts?: ClientOptions) {
    return api.get<ProfileByUsernameResponse>(
      `/profile/${encodeURIComponent(username)}`,
      { signal: opts?.signal }
    );
  },

  follow(targetUserId: string) {
    return api.post<FollowResult>("/profile/follow", { targetUserId });
  },

  updateMe(body: UpdateProfileBody) {
    return api.patch<UpdateProfileResponse>("/profile/me", body);
  },

  /** Own-profile tab treats every failure as an empty list — preserved. */
  async myStories(opts?: ClientOptions): Promise<MyStoriesResponse> {
    try {
      return await api.get<MyStoriesResponse>("/stories/me", {
        signal: opts?.signal,
      });
    } catch {
      return { stories: [] };
    }
  },
};

export const profileQueries = {
  byUsername(username: string) {
    return {
      queryKey: queryKeys.profile.byUsername(username),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        profileApi.get(username, { signal: ctx.signal }),
      retry: false as const,
    };
  },
  myStories(username: string, enabled: boolean) {
    return {
      queryKey: queryKeys.profile.myStories(username),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        profileApi.myStories({ signal: ctx.signal }),
      enabled,
    };
  },
};
