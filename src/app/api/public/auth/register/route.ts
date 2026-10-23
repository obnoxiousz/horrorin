import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { userRepository } from "@/repositories/user-repository";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Masukkan alamat email yang valid."),
  username: z.string().min(3, "Nama pengguna minimal 3 karakter.").max(20).regex(/^[a-z0-9_]+$/, "Nama pengguna hanya boleh berisi huruf kecil, angka, dan garis bawah."),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }
  const { name, email, username, password } = parsed.data;

  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) {
    return NextResponse.json({ error: "Alamat email sudah digunakan." }, { status: 409 });
  }
  const existingUsername = await userRepository.findByUsername(username);
  if (existingUsername) {
    return NextResponse.json({ error: "Nama pengguna sudah digunakan." }, { status: 409 });
  }

  const hashed = await hash(password, 12);
  const user = await userRepository.create({ name, email, username, password: hashed });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, username: user.username },
  });
}
