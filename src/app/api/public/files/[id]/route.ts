import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Serves an uploaded image by its unguessable id — the id is the capability.
 * Public so published stories render for guests; drafts rely on a random id
 * staying unlisted. Ids never change, so we cache immutably.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const upload = await db.upload.findUnique({
    where: { id },
    select: { mime: true, data: true },
  });
  if (!upload) {
    return NextResponse.json({ error: "File nggak ketemu" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(upload.data), {
    status: 200,
    headers: {
      "Content-Type": upload.mime,
      "Content-Length": String(upload.data.length),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
