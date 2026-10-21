import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/auth/session";
import { userRepository } from "@/repositories/user-repository";
import { notificationRepository } from "@/repositories";

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { targetUserId } = await req.json();
  if (!targetUserId || targetUserId === user!.id) {
    return NextResponse.json({ error: "Target nggak valid" }, { status: 400 });
  }
  const already = await userRepository.isFollowing(user!.id, targetUserId);
  if (already) {
    await userRepository.unfollow(user!.id, targetUserId);
    return NextResponse.json({ following: false });
  }
  await userRepository.follow(user!.id, targetUserId);
  await notificationRepository.create({
    userId: targetUserId,
    type: "FOLLOW",
    actorId: user!.id,
    title: `${user!.name ?? "Seseorang"} mulai nge-follow kamu`,
  });
  return NextResponse.json({ following: true });
}
