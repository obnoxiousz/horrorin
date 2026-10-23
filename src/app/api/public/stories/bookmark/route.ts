import { NextRequest, NextResponse } from "next/server";
import { engagementRepository } from "@/repositories/engagement-repository";
import { requireUser } from "@/auth/session";

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { storyId } = await req.json();
  if (!storyId) return NextResponse.json({ error: "ID cerita wajib diisi." }, { status: 400 });
  const result = await engagementRepository.toggleBookmark(user!.id, storyId);
  return NextResponse.json(result);
}
