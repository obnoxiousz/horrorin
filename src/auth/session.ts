import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth-options";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user as {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: string;
  };
}

export async function requireUser() {
  const u = await getSessionUser();
  if (!u) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Belum login nih" },
        { status: 401 },
      ),
    };
  }
  return { user: u, response: null };
}

export async function requireAdmin() {
  const u = await getSessionUser();
  if (!u) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Belum login nih" },
        { status: 401 },
      ),
    };
  }
  if (u.role !== "ADMIN") {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Khusus admin 👮" },
        { status: 403 },
      ),
    };
  }
  return { user: u, response: null };
}

export async function getUserProfile(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
}
