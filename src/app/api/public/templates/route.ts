import { NextResponse } from "next/server";
import { templateRepository } from "@/repositories";

export async function GET() {
  const templates = await templateRepository.findAll();
  return NextResponse.json({ templates });
}
