import { NextRequest, NextResponse } from "next/server";
import { storyRepository } from "@/repositories/story-repository";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ stories: [] });
  // need categoryId from slug
  const story = await storyRepository.findBySlug(slug);
  if (!story) return NextResponse.json({ stories: [] });
  const stories = await storyRepository.findRelated(story.id, story.categoryId, 4);
  return NextResponse.json({ stories });
}
