import { NextRequest, NextResponse } from "next/server";
import { storyRepository } from "@/repositories/story-repository";
import { getSessionUser } from "@/auth/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = (searchParams.get("sort") as "latest" | "trending" | "recommended") || "latest";
  const categorySlug = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const search = searchParams.get("q") || undefined;
  const skip = parseInt(searchParams.get("skip") || "0");
  const take = parseInt(searchParams.get("take") || "12");

  const stories = await storyRepository.findPublished({ skip, take, sort, categorySlug, tag, search });

  const user = await getSessionUser();
  let likedSet = new Set<string>();
  let bookmarkedSet = new Set<string>();
  if (user && stories.length) {
    const ids = stories.map((s) => s.id);
    const [liked, bookmarked] = await Promise.all([
      import("@/repositories/engagement-repository").then((m) =>
        m.engagementRepository.userLikedStoryIds(user.id, ids)
      ),
      import("@/repositories/engagement-repository").then((m) =>
        m.engagementRepository.userBookmarkedStoryIds(user.id, ids)
      ),
    ]);
    likedSet = liked;
    bookmarkedSet = bookmarked;
  }

  return NextResponse.json({
    stories: stories.map((s) => ({
      ...s,
      liked: likedSet.has(s.id),
      bookmarked: bookmarkedSet.has(s.id),
    })),
  });
}
