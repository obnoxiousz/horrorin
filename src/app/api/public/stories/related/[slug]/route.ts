import { NextRequest, NextResponse } from "next/server";
import { storyRepository } from "@/repositories/story-repository";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const story = await storyRepository.findBySlug(slug);
  if (!story) return NextResponse.json({ stories: [] });
  const stories = await storyRepository.findRelated(story.id, story.categoryId, 4);
  return NextResponse.json({ stories });
}
