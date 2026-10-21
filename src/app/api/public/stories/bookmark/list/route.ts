import { NextResponse } from "next/server";
import { requireUser } from "@/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  const bookmarks = await db.bookmark.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      story: {
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          category: true,
          template: { select: { id: true, slug: true, name: true } },
          tags: true,
        },
      },
    },
  });
  return NextResponse.json({ bookmarks: bookmarks.map((b) => b.story) });
}
