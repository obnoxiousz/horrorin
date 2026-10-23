import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/auth/session";
import { notificationRepository } from "@/repositories";

export async function GET(_req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const unread = await notificationRepository.unreadCount(user!.id);
  return NextResponse.json({ unread });
}
