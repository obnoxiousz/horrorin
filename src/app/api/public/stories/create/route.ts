import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/auth/session";
import { db } from "@/lib/db";
import { storyRepository } from "@/repositories/story-repository";
import { slugify } from "@/utils/format";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(120),
  excerpt: z.string().max(280).optional().nullable(),
  categoryId: z.string().min(1, "Kategori wajib"),
  templateId: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  blocks: z.array(
    z.object({
      type: z.string(),
      data: z.any(),
      order: z.number(),
    })
  ),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data nggak valid" },
      { status: 400 }
    );
  }
  const { title, excerpt, categoryId, templateId, thumbnailUrl, tags, blocks, status } = parsed.data;

  // Ensure unique slug
  let base = slugify(title);
  if (!base) base = "cerita";
  let slug = base;
  let i = 1;
  while (await db.story.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  // Estimate reading time from text blocks
  const allText = blocks
    .filter((b) => b.type === "text" || b.type === "quote")
    .map((b) => (b.data?.text ?? "") as string)
    .join(" ");
  const readingTime = Math.max(1, Math.ceil(allText.split(/\s+/).filter(Boolean).length / 200));

  const story = await db.story.create({
    data: {
      slug,
      title,
      excerpt: excerpt ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
      readingTime,
      status,
      authorId: user!.id,
      categoryId,
      templateId: templateId ?? null,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      tags: tags?.length
        ? {
            connectOrCreate: tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          }
        : undefined,
      blocks: {
        create: blocks.map((b) => ({
          type: b.type,
          data: JSON.stringify(b.data ?? {}),
          order: b.order,
        })),
      },
    },
    include: { blocks: true },
  });

  return NextResponse.json({ story });
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const body = await req.json().catch(() => ({}));
  const { id, title, excerpt, categoryId, templateId, thumbnailUrl, tags, blocks, status } = body ?? {};
  if (!id) return NextResponse.json({ error: "Id wajib" }, { status: 400 });

  const existing = await storyRepository.findById(id);
  if (!existing || existing.authorId !== user!.id) {
    return NextResponse.json({ error: "Cerita nggak ketemu" }, { status: 404 });
  }

  const allText = (blocks ?? [])
    .filter((b: any) => b.type === "text" || b.type === "quote")
    .map((b: any) => (b.data?.text ?? "") as string)
    .join(" ");
  const readingTime = Math.max(1, Math.ceil(allText.split(/\s+/).filter(Boolean).length / 200));

  // Update tags relation
  if (tags !== undefined) {
    await db.story.update({
      where: { id },
      data: { tags: { set: [] } },
    });
    if (tags.length > 0) {
      await db.story.update({
        where: { id },
        data: {
          tags: {
            connectOrCreate: tags.map((name: string) => ({
              where: { name },
              create: { name },
            })),
          },
        },
      });
    }
  }

  // Replace blocks
  if (blocks !== undefined) {
    await storyRepository.replaceBlocks(
      id,
      blocks.map((b: any) => ({
        type: b.type,
        data: JSON.stringify(b.data ?? {}),
        order: b.order,
      }))
    );
  }

  const updated = await db.story.update({
    where: { id },
    data: {
      ...(title !== undefined && { title, slug: slugify(title) + "-" + id.slice(-4) }),
      ...(excerpt !== undefined && { excerpt }),
      ...(categoryId !== undefined && { categoryId }),
      ...(templateId !== undefined && { templateId }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      ...(readingTime !== undefined && { readingTime }),
      ...(status !== undefined && {
        status,
        publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
      }),
    },
  });

  return NextResponse.json({ story: updated });
}
