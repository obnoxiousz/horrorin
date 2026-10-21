import { NextRequest, NextResponse } from "next/server";
import { notificationRepository } from "@/repositories";
import { requireUser } from "@/auth/session";

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { ids } = await req.json().catch(() => ({ ids: undefined }));
  await notificationRepository.markRead(user!.id, ids);
  return NextResponse.json({ ok: true });
}
