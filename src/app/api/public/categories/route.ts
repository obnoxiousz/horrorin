import { NextResponse } from "next/server";
import { categoryRepository, templateRepository } from "@/repositories";

export async function GET() {
  const [categories, templates] = await Promise.all([
    categoryRepository.findAll(),
    templateRepository.findAll(),
  ]);
  return NextResponse.json({ categories, templates });
}
