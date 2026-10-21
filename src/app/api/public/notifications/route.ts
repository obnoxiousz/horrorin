import { NextResponse } from "next/server";
import { notificationRepository } from "@/repositories";
import { requireUser } from "@/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  const notifications = await notificationRepository.findByUser(user!.id, 30);
  const unread = await notificationRepository.unreadCount(user!.id);

  // Enrich with actor + story (manual since no relations on Notification model)
  const actorIds = Array.from(new Set(notifications.map((n) => n.actorId).filter(Boolean) as string[]));
  const storyIds = Array.from(new Set(notifications.map((n) => n.storyId).filter(Boolean) as string[]));
  const [actors, stories] = await Promise.all([
    actorIds.length
      ? db.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true, username: true, image: true },
        })
      : Promise.resolve([]),
    storyIds.length
      ? db.story.findMany({
          where: { id: { in: storyIds } },
          select: { id: true, title: true, slug: true },
        })
      : Promise.resolve([]),
  ]);

  const actorMap = new Map(actors.map((a) => [a.id, a]));
  const storyMap = new Map(stories.map((s) => [s.id, s]));

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      ...n,
      actor: n.actorId ? actorMap.get(n.actorId) ?? null : null,
      story: n.storyId ? storyMap.get(n.storyId) ?? null : null,
    })),
    unread,
  });
}
