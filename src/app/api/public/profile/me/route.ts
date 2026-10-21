import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/auth/session";
import { userRepository } from "@/repositories/user-repository";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  const u = await userRepository.findById(user!.id);
  if (!u) return NextResponse.json({ error: "User nggak ketemu" }, { status: 404 });
  const [followersCount, followingCount] = await Promise.all([
    userRepository.followersCount(u.id),
    userRepository.followingCount(u.id),
  ]);
  return NextResponse.json({
    user: {
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
    },
  });
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const body = await req.json().catch(() => ({}));
  const { name, bio, image, username } = body;
  const updated = await userRepository.update(user!.id, {
    ...(name !== undefined && { name }),
    ...(username !== undefined && { username }),
    ...(image !== undefined && { image }),
    profile: bio !== undefined ? { update: { bio } } : undefined,
  });
  return NextResponse.json({ user: updated });
}
