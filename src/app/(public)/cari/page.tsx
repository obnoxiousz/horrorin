"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StoryCard } from "@/components/story/story-card";
import { ErrorState, EmptyState, StoryCardSkeleton } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { storyQueries } from "@/lib/api/stories";

export default function CariPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CariInner />
    </Suspense>
  );
}

function CariInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [input, setInput] = useState(q);

  useEffect(() => {
    setInput(q);
    document.title = q ? `Cari "${q}" — Horrorin` : "Cari — Horrorin";
  }, [q]);

  const { data, isLoading, isError, refetch } = useQuery(
    storyQueries.list({ q, take: 24 }, q.length > 0)
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    router.push(`/cari?q=${encodeURIComponent(trimmed)}`);
  };

  const stories = data?.stories ?? [];
  const hasQuery = q.length > 0;

  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* ===== Back ===== */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Balik ke beranda
        </Link>

        {/* ===== Search input ===== */}
        <form onSubmit={onSubmit} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Cari cerita horor..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-12 pr-12 h-14 rounded-full bg-background/60 text-base"
              autoFocus
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* ===== Results ===== */}
        {!hasQuery ? (
          <EmptyState
            title="Cari cerita"
            description="Masukkan judul, nama kreator, atau kata kunci."
            icon={<Search className="w-10 h-10 text-primary" />}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <StoryCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : stories.length === 0 ? (
          <EmptyState
            title={`Tidak ada hasil untuk "${q}"`}
            description="Coba kata kunci lain atau lihat cerita yang sedang tren."
            action={{ label: "Lihat Cerita Populer", href: "/trending" }}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Ketemu <span className="font-semibold text-foreground">{stories.length}</span> cerita buat{" "}
              <span className="font-semibold text-foreground">"{q}"</span>
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {stories.map((s: any) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
