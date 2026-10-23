import { NextRequest, NextResponse } from "next/server";
import { engagementRepository } from "@/repositories/engagement-repository";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ comments: [] });
  const comments = await engagementRepository.listCommentsBySlug(slug);
  return NextResponse.json({ comments });
}
