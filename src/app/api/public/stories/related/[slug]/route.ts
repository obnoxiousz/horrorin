import { NextRequest, NextResponse } from "next/server";
import { storyRepository } from "@/repositories/story-repository";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const stories = await storyRepository.findRelatedBySlug(slug);
  return NextResponse.json({ stories });
}
