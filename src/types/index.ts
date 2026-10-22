// Shared types across Horrorin app

export interface SafeUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  role: string;
}

export interface StoryBlockData {
  // text
  text?: string;
  // image
  imageUrl?: string;
  caption?: string;
  // quote
  author?: string;
  // gallery
  images?: { url: string; caption?: string }[];
  // timeline
  timeline?: { time: string; title: string; description: string }[];
  // conversation / chat
  messages?: { from: "A" | "B" | "me" | "them"; name?: string; text: string; time?: string }[];
  // investigation / police / cctv / news / diary
  caseNumber?: string;
  classification?: string;
  location?: string;
  datetime?: string;
  observedBy?: string;
  readings?: { label: string; value: string; status?: "normal" | "warning" | "critical" }[];
  paragraphs?: string[];
  // generic styling
  align?: "left" | "center" | "right";
  fontSize?: "sm" | "md" | "lg" | "xl";
  color?: string;
  background?: string;
  spacing?: "tight" | "normal" | "loose";
}

export interface StoryBlockDTO {
  id: string;
  type: string;
  data: StoryBlockData;
  order: number;
}

export interface StoryDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  readingTime: number;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  categoryId: string;
  category: {
    id: string;
    slug: string;
    name: string;
    color: string | null;
    icon: string | null;
  };
  templateId: string | null;
  template: {
    id: string;
    slug: string;
    name: string;
  } | null;
  tags: { id: string; name: string }[];
  blocks: StoryBlockDTO[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
  bookmarked?: boolean;
}

export interface NotificationDTO {
  id: string;
  type: string;
  actorId: string | null;
  actor?: { id: string; name: string | null; image: string | null; username: string | null } | null;
  storyId: string | null;
  story?: { id: string; title: string; slug: string } | null;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
}

export interface ProfileDTO {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  role: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  storiesCount: number;
  isFollowing?: boolean;
}

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  createdAt: string;
}

export interface CategoryWithCount extends CategoryRow {
  _count: {
    stories: number;
  };
}

export interface TemplateDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  structure: string;
  previewUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Story list payloads carry no blocks; the flag stays optional for detail reuse. */
export type StoryListItem = Omit<StoryDTO, "blocks"> & {
  blocks?: StoryDTO["blocks"];
};

export interface CommentDTO {
  id: string;
  storyId: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  content: string;
  parentId: string | null;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserRow {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  createdAt: string;
  _count: {
    stories: number;
    followersRel: number;
    followingRel: number;
  };
}

export interface AdminStoryRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  readingTime: number;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  authorId: string;
  categoryId: string;
  templateId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  category: CategoryRow;
}
