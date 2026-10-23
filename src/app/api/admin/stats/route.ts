import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/auth/session";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const [users, total, published, draft, archived, aggregates, recent] =
    await Promise.all([
      db.user.count(),
      db.story.count(),
      db.story.count({ where: { status: "PUBLISHED" } }),
      db.story.count({ where: { status: "DRAFT" } }),
      db.story.count({ where: { status: "ARCHIVED" } }),
      db.story.aggregate({
        _sum: { viewCount: true, likeCount: true, commentCount: true },
      }),
      db.story.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          createdAt: true,
          author: { select: { id: true, name: true, username: true, image: true } },
        },
      }),
    ]);

  return NextResponse.json({
    users,
    stories: { total, published, draft, archived },
    views: aggregates._sum.viewCount ?? 0,
    likes: aggregates._sum.likeCount ?? 0,
    comments: aggregates._sum.commentCount ?? 0,
    recent,
  });
}
