import { NextRequest, NextResponse } from "next/server";
import { engagementRepository } from "@/repositories/engagement-repository";
import { requireUser } from "@/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await params;
  const comments = await engagementRepository.listComments(storyId);
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ storyId: string }> }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { storyId } = await params;
  const { content, parentId } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Komentar tidak boleh kosong." }, { status: 400 });
  }
  const comment = await engagementRepository.createComment({
    storyId,
    authorId: user!.id,
    content: content.trim(),
    parentId,
  });
  return NextResponse.json({ comment });
}
