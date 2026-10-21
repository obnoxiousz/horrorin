import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/auth/session";
import { storyRepository } from "@/repositories/story-repository";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const { status } = await req.json();
  const updated = await storyRepository.update(id, { status });
  return NextResponse.json({ story: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  await storyRepository.delete(id);
  return NextResponse.json({ ok: true });
}
