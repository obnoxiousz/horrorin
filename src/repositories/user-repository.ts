import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export const userRepository = {
  async findByEmail(email: string) {
    return db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });
  },

  async findByUsername(username: string) {
    return db.user.findUnique({ where: { username }, include: { profile: true } });
  },

  async findById(id: string) {
    return db.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  },

  async create(data: {
    email: string;
    password: string;
    name?: string;
    username?: string;
  }) {
    return db.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: data.password,
        name: data.name,
        username: data.username,
        profile: { create: {} },
      },
      include: { profile: true },
    });
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return db.user.update({ where: { id }, data, include: { profile: true } });
  },

  async follow(followerId: string, followingId: string) {
    return db.follow.create({ data: { followerId, followingId } });
  },

  async unfollow(followerId: string, followingId: string) {
    return db.follow.deleteMany({
      where: { followerId, followingId },
    });
  },

  async isFollowing(followerId: string, followingId: string) {
    const f = await db.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!f;
  },

  async followersCount(userId: string) {
    return db.follow.count({ where: { followingId: userId } });
  },

  async followingCount(userId: string) {
    return db.follow.count({ where: { followerId: userId } });
  },

  async listAll(params: { skip?: number; take?: number; search?: string } = {}) {
    const { skip = 0, take = 20, search } = params;
    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { username: { contains: search } },
        { email: { contains: search } },
      ];
    }
    return db.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        createdAt: true,
        _count: { select: { stories: true, followersRel: true, followingRel: true } },
      },
    });
  },
};
