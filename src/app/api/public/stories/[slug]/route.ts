import { NextRequest, NextResponse } from "next/server";
import { storyRepository } from "@/repositories/story-repository";
import { engagementRepository } from "@/repositories/engagement-repository";
import { getSessionUser } from "@/auth/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const story = await storyRepository.findBySlug(slug);
  if (!story || story.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Cerita tidak ditemukan." }, { status: 404 });
  }

  // Fire-and-forget view increment
  storyRepository.incrementView(story.id).catch(() => {});

  const user = await getSessionUser();
  let liked = false;
  let bookmarked = false;
  if (user) {
    const [l, b] = await Promise.all([
      engagementRepository.userLikedStoryIds(user.id, [story.id]),
      engagementRepository.userBookmarkedStoryIds(user.id, [story.id]),
    ]);
    liked = l.has(story.id);
    bookmarked = b.has(story.id);
  }

  return NextResponse.json({ story: { ...story, liked, bookmarked } });
}
