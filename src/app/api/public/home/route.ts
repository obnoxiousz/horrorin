import { NextResponse } from "next/server";
import { storyRepository } from "@/repositories/story-repository";
import { categoryRepository } from "@/repositories";
import { engagementRepository } from "@/repositories/engagement-repository";
import { getSessionUser } from "@/auth/session";

export async function GET() {
  const [latest, trendingPool, recommended, categories] = await Promise.all([
    storyRepository.findPublished({ sort: "latest", take: 8 }),
    storyRepository.findPublished({ sort: "trending", take: 20 }),
    storyRepository.findPublished({ sort: "recommended", take: 4 }),
    categoryRepository.findAll(),
  ]);

  // trending is just the head of the same trending take-20 query (same where,
  // same orderBy) — one fewer query, and tie order stays consistent.
  const trending = trendingPool.slice(0, 4);

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

  // Creators: unique authors in trending order (first-seen), first 6.
  const seenAuthors = new Set<string>();
  const creators: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  }[] = [];
  for (const s of trendingPool) {
    if (!s.author || seenAuthors.has(s.author.id)) continue;
    seenAuthors.add(s.author.id);
    creators.push({
      id: s.author.id,
      name: s.author.name,
      username: s.author.username,
      image: s.author.image,
    });
    if (creators.length === 6) break;
  }

  return NextResponse.json({
    latest: latest.map(flag),
    trending: trending.map(flag),
    recommended: recommended.map(flag),
    categories,
    creators,
  });
}
