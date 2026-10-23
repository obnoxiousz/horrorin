"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StoryCard } from "@/components/story/story-card";
import { LoadingState, ErrorState, EmptyState, StoryCardSkeleton } from "@/components/ui/states";
import { storyQueries } from "@/lib/api/stories";

export default function TerbaruPage() {
  useEffect(() => {
    document.title = "Cerita Terbaru — Horrorin";
  }, []);

  const { data, isLoading, isError, refetch } = useQuery(
    storyQueries.list({ sort: "latest", take: 24 })
  );

  const stories = data?.stories ?? [];

  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* ===== Header ===== */}
        <header className="relative overflow-hidden rounded-3xl mb-8">
          <div className="absolute inset-0 horror-gradient" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="relative p-6 sm:p-10 flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Cerita Terbaru
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Cerita horor yang baru diterbitkan oleh para kreator.
              </p>
            </div>
          </div>
        </header>

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
            title="Belum ada cerita baru"
            description="Cerita yang baru diterbitkan akan muncul di sini."
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
