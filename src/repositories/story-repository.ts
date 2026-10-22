import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export type StoryWithRelations = Prisma.StoryGetPayload<{
  include: {
    author: { select: { id: true; name: true; username: true; image: true } };
    category: true;
    template: { select: { id: true; slug: true; name: true } };
    tags: true;
    blocks: { orderBy: { order: "asc" } };
  };
}>;

export const storyRepository = {
  async findPublished(params: {
    skip?: number;
    take?: number;
    categorySlug?: string;
    tag?: string;
    sort?: "latest" | "trending" | "recommended";
    search?: string;
  } = {}) {
    const { skip = 0, take = 12, categorySlug, tag, sort = "latest", search } = params;
    const where: Prisma.StoryWhereInput = {
      status: "PUBLISHED",
    };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (tag) {
      where.tags = { some: { name: tag } };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }
    let orderBy: Prisma.StoryOrderByWithRelationInput | Prisma.StoryOrderByWithRelationInput[] = { publishedAt: "desc" };
    if (sort === "trending") {
      orderBy = [{ likeCount: "desc" }, { viewCount: "desc" }];
    } else if (sort === "recommended") {
      orderBy = [{ bookmarkCount: "desc" }, { likeCount: "desc" }];
    }
    return db.story.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        category: true,
        template: { select: { id: true, slug: true, name: true } },
        tags: true,
      },
    });
  },

  async findBySlug(slug: string) {
    return db.story.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, username: true, image: true, bio: true } },
        category: true,
        template: { select: { id: true, slug: true, name: true } },
        tags: true,
        blocks: { orderBy: { order: "asc" } },
      },
    });
  },

  async findById(id: string) {
    return db.story.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        category: true,
        template: { select: { id: true, slug: true, name: true } },
        tags: true,
        blocks: { orderBy: { order: "asc" } },
      },
    });
  },

  async findByAuthor(authorId: string, status?: string) {
    const where: Prisma.StoryWhereInput = { authorId };
    if (status) where.status = status;
    return db.story.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        template: { select: { id: true, slug: true, name: true } },
        tags: true,
      },
    });
  },

  async incrementView(id: string) {
    return db.story.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  async findRelated(storyId: string, categoryId: string, take = 4) {
    return db.story.findMany({
      where: {
        categoryId,
        status: "PUBLISHED",
        id: { not: storyId },
      },
      take,
      orderBy: { likeCount: "desc" },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        category: true,
        template: { select: { id: true, slug: true, name: true } },
        tags: true,
      },
    });
  },

  async create(data: Prisma.StoryCreateInput) {
    return db.story.create({ data });
  },

  async update(id: string, data: Prisma.StoryUpdateInput) {
    return db.story.update({ where: { id }, data });
  },

  async delete(id: string) {
    return db.story.delete({ where: { id } });
  },

  async count(params: { categorySlug?: string; search?: string } = {}) {
    const { categorySlug, search } = params;
    const where: Prisma.StoryWhereInput = { status: "PUBLISHED" };
    if (categorySlug) where.category = { slug: categorySlug };
    if (search) where.OR = [{ title: { contains: search } }, { excerpt: { contains: search } }];
    return db.story.count({ where });
  },

  async replaceBlocks(storyId: string, blocks: { type: string; data: string; order: number }[]) {
    await db.storyBlock.deleteMany({ where: { storyId } });
    if (blocks.length === 0) return [];
    return db.storyBlock.createMany({
      data: blocks.map((b) => ({ ...b, storyId })),
    });
  },
};
