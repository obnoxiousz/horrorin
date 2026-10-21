import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/auth/session";
import { storyRepository } from "@/repositories/story-repository";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  const stories = await storyRepository.findByAuthor(user!.id);
  return NextResponse.json({ stories });
}
