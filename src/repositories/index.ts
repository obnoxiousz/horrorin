import { db } from "@/lib/db";

export const categoryRepository = {
  async findAll() {
    return db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { stories: { where: { status: "PUBLISHED" } } } },
      },
    });
  },
  async findBySlug(slug: string) {
    return db.category.findUnique({ where: { slug } });
  },
  async create(data: {
    slug: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }) {
    return db.category.create({ data });
  },
};

export const templateRepository = {
  async findAll() {
    return db.storyTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
  },
  async findBySlug(slug: string) {
    return db.storyTemplate.findUnique({ where: { slug } });
  },
  async findById(id: string) {
    return db.storyTemplate.findUnique({ where: { id } });
  },
};

export const notificationRepository = {
  async findByUser(userId: string, take = 20) {
    return db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  },
  async markRead(userId: string, ids?: string[]) {
    const where: any = { userId };
    if (ids) where.id = { in: ids };
    return db.notification.updateMany({ where, data: { read: true } });
  },
  async unreadCount(userId: string) {
    return db.notification.count({ where: { userId, read: false } });
  },
  async create(data: {
    userId: string;
    type: string;
    actorId?: string;
    storyId?: string;
    title: string;
    body?: string;
  }) {
    return db.notification.create({ data });
  },
};
