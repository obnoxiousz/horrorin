import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/auth/session";
import { userRepository } from "@/repositories/user-repository";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { role, banned } = body;
  const user = await userRepository.update(id, {
    ...(role !== undefined && { role }),
    ...(banned !== undefined && { banned }),
  });
  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  await userRepository.update(id, { banned: true });
  return NextResponse.json({ ok: true });
}
