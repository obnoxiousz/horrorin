import { NextResponse } from "next/server";
import { storyRepository } from "@/repositories/story-repository";
import { categoryRepository } from "@/repositories";
import { engagementRepository } from "@/repositories/engagement-repository";
import { getSessionUser } from "@/auth/session";

export async function GET() {
  const [latest, trending, recommended, trendingForCreators, categories] =
    await Promise.all([
      storyRepository.findPublished({ sort: "latest", take: 8 }),
      storyRepository.findPublished({ sort: "trending", take: 4 }),
      storyRepository.findPublished({ sort: "recommended", take: 4 }),
      storyRepository.findPublished({ sort: "trending", take: 20 }),
      categoryRepository.findAll(),
    ]);

  const user = await getSessionUser();
  const ids = Array.from(
    new Set([...latest, ...trending, ...recommended].map((s) => s.id))
  );
  let likedSet = new Set<string>();
  let bookmarkedSet = new Set<string>();
  if (user && ids.length) {
    [likedSet, bookmarkedSet] = (await Promise.all([
      engagementRepository.userLikedStoryIds(user.id, ids),
      engagementRepository.userBookmarkedStoryIds(user.id, ids),
    ])) as Set<string>[];
  }
  const flag = (s: (typeof latest)[number]) => ({
    ...s,
    liked: likedSet.has(s.id),
    bookmarked: bookmarkedSet.has(s.id),
  });

  // Creators derived server-side from trending take 20 (same logic the old
  // client hook used): unique authors, sorted by total likes, top 6.
  const byAuthor = new Map<
    string,
    {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
      storyCount: number;
      totalLikes: number;
    }
  >();
  for (const s of trendingForCreators) {
    if (!s.author) continue;
    const prev = byAuthor.get(s.author.id);
    if (prev) {
      prev.storyCount += 1;
      prev.totalLikes += s.likeCount ?? 0;
    } else {
      byAuthor.set(s.author.id, {
        id: s.author.id,
        name: s.author.name,
        username: s.author.username,
        image: s.author.image,
        storyCount: 1,
        totalLikes: s.likeCount ?? 0,
      });
    }
  }
  const creators = Array.from(byAuthor.values())
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 6);

  return NextResponse.json({
    latest: latest.map(flag),
    trending: trending.map(flag),
    recommended: recommended.map(flag),
    categories,
    creators,
  });
}
