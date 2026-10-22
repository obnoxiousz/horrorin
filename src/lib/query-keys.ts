// Single source of truth for TanStack Query keys. Key literals never appear
// outside this file — pages/components call a factory below, and
// invalidateQueries/setQueryData must reference these same factories.
//
// Conventions:
// - Hierarchy: "all" roots like stories / admin let parent keys invalidate
//   every child (React Query prefix matching on tuple keys).
// - Read keys are more specific than invalidation roots, e.g. admin.users()
//   invalidates, admin.usersList(search) reads.
// - Filters go into keys as plain objects — built here in a canonical order
//   so identical params always hash to the same cache entry.

import type { StoryListFilters } from "@/lib/api/stories";

export const queryKeys = {
  stories: {
    all: ["stories"] as const,
    lists: () => [...queryKeys.stories.all, "list"] as const,
    /** read key: feed exact filters; built in one canonical shape */
    list: (filters: StoryListFilters) => {
      const { sort, take, category, tag, q } = filters;
      return [
        ...queryKeys.stories.lists(),
        { sort, take, category, tag, q },
      ] as const;
    },
    detail: (slug: string) => ["story", slug] as const,
    related: (slug: string) => ["related", slug] as const,
    draft: (id: string) => [...queryKeys.stories.all, "draft", id] as const,
  },
  comments: {
    all: ["comments"] as const,
    byStory: (storyId: string) => [...queryKeys.comments.all, storyId] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  profile: {
    all: ["profile"] as const,
    byUsername: (username: string) => [...queryKeys.profile.all, username] as const,
    myStories: (username: string) => ["my-stories", username] as const,
  },
  bookmarks: {
    all: ["bookmarks"] as const,
  },
  admin: {
    all: ["admin"] as const,
    /** invalidation root for the users table */
    users: () => [...queryKeys.admin.all, "users"] as const,
    usersList: (search?: string) =>
      [...queryKeys.admin.users(), { search }] as const,
    stories: () => [...queryKeys.admin.all, "stories"] as const,
  },
} as const;
