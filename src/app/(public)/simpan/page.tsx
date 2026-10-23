"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StoryCard } from "@/components/story/story-card";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { SkeletonCardGrid, SkeletonPageHeader } from "@/components/ui/skeletons";
import { useSession } from "next-auth/react";
import { bookmarkQueries } from "@/lib/api/bookmarks";

export default function SimpanPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    document.title = "Simpanan — Horrorin";
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/masuk?next=/simpan");
    }
  }, [status, router]);

  const { data, isLoading, isError, refetch } = useQuery(
    bookmarkQueries.list(status === "authenticated")
  );

  if (status === "loading" || status === "unauthenticated" || isLoading) {
    return (
      <AppShell>
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <SkeletonPageHeader className="mb-8" />
          <SkeletonCardGrid count={8} />
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell>
        <ErrorState onRetry={() => refetch()} />
      </AppShell>
    );
  }

  const bookmarks = data?.bookmarks ?? [];

  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12 animate-in fade-in duration-300">
        {/* ===== Header ===== */}
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Cerita Tersimpan</h1>
              <p className="text-sm text-muted-foreground">
                {bookmarks.length > 0
                  ? `${bookmarks.length} cerita yang kamu simpan buat dibaca nanti`
                  : "Cerita yang kamu simpen bakal muncul di sini"}
              </p>
            </div>
          </div>
        </header>

        {/* ===== Grid ===== */}
        {bookmarks.length === 0 ? (
          <EmptyState
            title="Belum ada cerita tersimpan"
            description="Simpan cerita untuk membacanya nanti dengan memilih ikon bookmark."
            icon={<Bookmark className="w-10 h-10 text-primary" />}
            action={{ label: "Jelajahi Cerita", href: "/trending" }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {bookmarks.map((s: any) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
