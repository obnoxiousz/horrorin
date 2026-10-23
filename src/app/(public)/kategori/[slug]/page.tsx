"use client";

import { use, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StoryCard } from "@/components/story/story-card";
import { ErrorState, EmptyState, StoryCardSkeleton } from "@/components/ui/states";
import { getCategory } from "@/constants";
import { cn } from "@/lib/utils";
import { storyQueries } from "@/lib/api/stories";

const SORTS = [
  { value: "latest", label: "Terbaru" },
  { value: "trending", label: "Trending" },
  { value: "recommended", label: "Rekomendasi" },
] as const;

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [sort, setSort] = useState<"latest" | "trending" | "recommended">("latest");

  const category = getCategory(slug);

  useEffect(() => {
    document.title = `${category?.name ?? "Kategori"} — Horrorin`;
  }, [category]);

  const { data, isLoading, isError, refetch } = useQuery(
    storyQueries.list({ category: slug, sort, take: 24 })
  );

  const stories = data?.stories ?? [];

  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* ===== Back ===== */}
        <Link
          href="/kategori"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Semua kategori
        </Link>

        {/* ===== Header ===== */}
        <header
          className="relative overflow-hidden rounded-3xl mb-8"
          style={{
            background: category
              ? `linear-gradient(135deg, ${category.color}25, transparent)`
              : undefined,
          }}
        >
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40"
            style={{ backgroundColor: category?.color ?? "#ef4444" }}
          />

          <div className="relative p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 text-4xl sm:text-5xl"
              style={{ backgroundColor: `${category?.color ?? "#ef4444"}20` }}
            >
              {category?.emoji ?? "👻"}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {category?.name ?? "Kategori"}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {stories.length > 0
                  ? `${stories.length} cerita horror tentang ${category?.name ?? "ini"}`
                  : `Belum ada cerita di kategori ${category?.name ?? "ini"}.`}
              </p>
            </div>
          </div>
        </header>

        {/* ===== Sort pills ===== */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                sort === s.value
                  ? "bg-primary text-primary-foreground"
                  : "glass hover:glass-strong text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ===== Grid ===== */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <StoryCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : stories.length === 0 ? (
          <EmptyState
            title="Belum ada cerita di kategori ini"
            description="Cerita dalam kategori ini akan muncul di sini."
            action={{ label: "Mulai Cerita Baru ", href: "/editor" }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {stories.map((s: any) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
