import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/auth/session";
import { userRepository } from "@/repositories/user-repository";

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") || undefined;
  const users = await userRepository.listAll({ search, take: 50 });
  return NextResponse.json({ users });
}
