import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import { queryOptions } from "@tanstack/react-query";
import type { ProfileDTO } from "@/types";

export type UpdateProfileBody = {
  name: string;
  bio: string | null;
  image: string | null;
  username: string;
};

export interface ProfileResponse {
  profile: ProfileDTO | null;
}

export interface FollowResult {
  following: boolean;
}

export const profileApi = {
  byUsername(username: string, opts?: ClientOptions) {
    return api.get<ProfileResponse>(
      `/public/profile/${encodeURIComponent(username)}`,
      { signal: opts?.signal }
    );
  },

  follow(id: string) {
    return api.post<FollowResult>("/public/profile/follow", { id });
  },

  updateMe(body: UpdateProfileBody) {
    return api.patch<{ profile: ProfileDTO }>("/public/profile/me", body);
  },
};

export const profileQueries = {
  byUsername(username: string) {
    return queryOptions({
      queryKey: queryKeys.profile.byUsername(username),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        profileApi.byUsername(username, { signal: ctx.signal }),
      retry: false as const,
    });
  },
};
