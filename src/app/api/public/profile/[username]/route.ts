import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/repositories/user-repository";
import { storyRepository } from "@/repositories/story-repository";
import { getSessionUser } from "@/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const u = await userRepository.findByUsername(username);
  if (!u) return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });

  const [followersCount, followingCount, stories, session] = await Promise.all([
    userRepository.followersCount(u.id),
    userRepository.followingCount(u.id),
    storyRepository.findByAuthor(u.id, "PUBLISHED"),
    getSessionUser(),
  ]);
  const isFollowing = session ? await userRepository.isFollowing(session.id, u.id) : false;

  return NextResponse.json({
    profile: {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      image: u.image,
      bio: u.profile?.bio ?? u.bio,
      role: u.role,
      createdAt: u.createdAt,
      followersCount,
      followingCount,
      storiesCount: stories.length,
      isFollowing,
    },
    stories,
  });
}
