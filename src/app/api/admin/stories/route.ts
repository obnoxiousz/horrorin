import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  const stories = await db.story.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      category: true,
    },
  });
  return NextResponse.json({ stories });
}
