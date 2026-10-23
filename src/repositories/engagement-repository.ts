import { db } from "@/lib/db";

export const engagementRepository = {
  async toggleLike(userId: string, storyId: string) {
    const existing = await db.like.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });
    if (existing) {
      await db.like.delete({ where: { id: existing.id } });
      await db.story.update({
        where: { id: storyId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    }
    await db.like.create({ data: { userId, storyId } });
    await db.story.update({
      where: { id: storyId },
      data: { likeCount: { increment: 1 } },
    });
    return { liked: true };
  },

  async toggleBookmark(userId: string, storyId: string) {
    const existing = await db.bookmark.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });
    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      await db.story.update({
        where: { id: storyId },
        data: { bookmarkCount: { decrement: 1 } },
      });
      return { bookmarked: false };
    }
    await db.bookmark.create({ data: { userId, storyId } });
    await db.story.update({
      where: { id: storyId },
      data: { bookmarkCount: { increment: 1 } },
    });
    return { bookmarked: true };
  },

  async userLikedStoryIds(userId: string, storyIds: string[]) {
    const likes = await db.like.findMany({
      where: { userId, storyId: { in: storyIds } },
      select: { storyId: true },
    });
    return new Set(likes.map((l) => l.storyId));
  },

  async userBookmarkedStoryIds(userId: string, storyIds: string[]) {
    const bms = await db.bookmark.findMany({
      where: { userId, storyId: { in: storyIds } },
      select: { storyId: true },
    });
    return new Set(bms.map((b) => b.storyId));
  },

  async listComments(storyId: string) {
    return db.comment.findMany({
      where: { storyId },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
      },
    });
  },

  async listCommentsBySlug(slug: string) {
    const story = await db.story.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!story) return [];
    return this.listComments(story.id);
  },

  async createComment(data: { storyId: string; authorId: string; content: string; parentId?: string }) {
    const c = await db.comment.create({ data });
    await db.story.update({
      where: { id: data.storyId },
      data: { commentCount: { increment: 1 } },
    });
    return c;
  },

  async deleteComment(id: string) {
    const c = await db.comment.findUnique({ where: { id } });
    if (!c) return null;
    await db.comment.delete({ where: { id } });
    await db.story.update({
      where: { id: c.storyId },
      data: { commentCount: { decrement: 1 } },
    });
    return c;
  },
};
