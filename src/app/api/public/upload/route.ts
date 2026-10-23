import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/auth/session";

const MAX_BYTES = 3 * 1024 * 1024;
const MAX_UPLOADS_PER_USER = 50;
const MAX_TOTAL_BYTES_PER_USER = 100 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

// The decoded buffer must really be the declared image type — a data-URL
// knob alone proves nothing about the payload.
function magicBytesMatch(mime: string, bytes: Buffer): boolean {
  switch (mime) {
    case "image/png":
      return bytes.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      );
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/webp":
      return (
        bytes.subarray(0, 4).toString("latin1") === "RIFF" &&
        bytes.subarray(8, 12).toString("latin1") === "WEBP"
      );
    case "image/gif":
      return (
        bytes.subarray(0, 6).toString("latin1") === "GIF87a" ||
        bytes.subarray(0, 6).toString("latin1") === "GIF89a"
      );
    default:
      return false;
  }
}

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
  if (!magicBytesMatch(mime, bytes)) {
    return NextResponse.json(
      { error: "Isi file nggak cocok sama tipenya" },
      { status: 415 }
    );
  }

  // Per-user quota: at most 50 uploads and 100MB stored total.
  const [count, stored] = await Promise.all([
    db.upload.count({ where: { userId: user.id } }),
    db.upload.aggregate({ where: { userId: user.id }, _sum: { size: true } }),
  ]);
  if (count >= MAX_UPLOADS_PER_USER) {
    return NextResponse.json(
      { error: "Kuota upload habis (maks 50 gambar per akun)" },
      { status: 429 }
    );
  }
  if ((stored._sum.size ?? 0) + bytes.length > MAX_TOTAL_BYTES_PER_USER) {
    return NextResponse.json(
      { error: "Kuota total gambar penuh (maks 100MB per akun)" },
      { status: 413 }
    );
  }

  const upload = await db.upload.create({
    data: { userId: user.id, mime, size: bytes.length, data: bytes },
  });
  return NextResponse.json({ url: `/api/public/files/${upload.id}` });
}
