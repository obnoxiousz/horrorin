/**
 * Central query-key registry for @tanstack/react-query.
 *
 * Only keys consumed TODAY live here; Phase 1 adds home/admin-stats/unread keys
 * when their endpoints exist. Anything not listed must not be created ad hoc.
 *
 * NOTE: invalidating queryKeys.stories.all covers every story query on the
 * client: lists, detail, related, mine and editor drafts.
 */
export const queryKeys = {
  stories: {
    all: ["stories"] as const,
    lists: () => [...queryKeys.stories.all, "list"] as const,
    list: (filters?: {
      sort?: "latest" | "trending" | "recommended";
      take?: number;
      category?: string;
      tag?: string;
      q?: string;
    }) =>
      [
        ...queryKeys.stories.lists(),
        {
          sort: filters?.sort,
          take: filters?.take,
          category: filters?.category,
          tag: filters?.tag,
          q: filters?.q,
        },
      ] as const,
    detail: (slug: string) => [...queryKeys.stories.all, "detail", slug] as const,
    related: (slug: string) => [...queryKeys.stories.all, "related", slug] as const,
    mine: (username: string) => [...queryKeys.stories.all, "mine", username] as const,
    drafts: () => [...queryKeys.stories.all, "draft"] as const,
    draft: (editId: string) => [...queryKeys.stories.drafts(), editId] as const,
  },
  comments: {
    all: ["comments"] as const,
    byStory: (storyId: string) => [...queryKeys.comments.all, storyId] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => queryKeys.categories.all,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => queryKeys.notifications.all,
  },
  profile: {
    all: ["profile"] as const,
    byUsername: (username: string) => [...queryKeys.profile.all, username] as const,
  },
  bookmarks: {
    all: ["bookmarks"] as const,
    list: () => queryKeys.bookmarks.all,
  },
  admin: {
    all: ["admin"] as const,
    // Invalidation root — prefix-matches every usersList read key.
    users: () => [...queryKeys.admin.all, "users"] as const,
    // Read key — search embedded as an object so the root above can invalidate it.
    usersList: (search: string) => [...queryKeys.admin.users(), { search }] as const,
    stories: () => [...queryKeys.admin.all, "stories"] as const,
  },
} as const;
