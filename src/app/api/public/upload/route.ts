import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/auth/session";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  let dataUrl: unknown;
  try {
    ({ dataUrl } = await req.json());
  } catch {
    return NextResponse.json({ error: "Body JSON nggak valid" }, { status: 400 });
  }
  if (typeof dataUrl !== "string") {
    return NextResponse.json({ error: "dataUrl wajib ada" }, { status: 400 });
  }

  const match = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    dataUrl
  );
  if (!match) {
    return NextResponse.json(
      { error: "Format nggak didukung, harus data URL base64" },
      { status: 400 }
    );
  }
  const mime = match[1].toLowerCase();
  if (!ALLOWED.has(mime)) {
    return NextResponse.json(
      { error: "Tipe file nggak didukung (png/jpg/webp/gif aja)" },
      { status: 415 }
    );
  }
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "Ukuran file kegedean (maks 3MB)" },
      { status: 413 }
    );
  }

  const upload = await db.upload.create({
    data: { userId: user.id, mime, size: bytes.length, data: bytes },
  });
  return NextResponse.json({ url: `/api/public/files/${upload.id}` });
}
