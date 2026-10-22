"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Users, ArrowRight, BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { storyQueries } from "@/lib/api/stories";

export default function KreatorPage() {
  useEffect(() => {
    document.title = "Kreator Horrorin — Horrorin";
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    ...storyQueries.list({ sort: "trending", take: 50 }),
    select: (d: { stories: any[] }) => {
      // Extract unique authors with story count
      const map = new Map<string, any>();
      for (const s of d.stories ?? []) {
        if (s.author) {
          if (!map.has(s.author.id)) {
            map.set(s.author.id, { ...s.author, storyCount: 1, totalLikes: s.likeCount ?? 0 });
          } else {
            const existing = map.get(s.author.id);
            existing.storyCount += 1;
            existing.totalLikes += s.likeCount ?? 0;
          }
        }
      }
      return Array.from(map.values()).sort((a: any, b: any) => b.totalLikes - a.totalLikes);
    },
  });

  const creators = data ?? [];

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
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Kreator Horrorin 
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Sumber cerita serem favorit pembaca. Follow kreator favoritmu biar nggak ketinggalan cerita baru.
              </p>
            </div>
          </div>
        </header>

        {/* ===== Grid ===== */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="rounded-3xl glass p-6 text-center animate-pulse">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4" />
                <div className="h-4 w-2/3 bg-muted rounded mx-auto mb-2" />
                <div className="h-3 w-1/2 bg-muted rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : creators.length === 0 ? (
          <EmptyState
            title="Belum ada kreator nih 👻"
            description="Jadilah kreator pertama dan mulai posting cerita seremmu!"
            action={{ label: "Gabung Horrorin 🚀", href: "/gabung" }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {creators.map((c: any) => (
              <Link
                key={c.id}
                href={`/u/${c.username ?? c.id}`}
                className="group relative overflow-hidden rounded-3xl p-6 glass hover:glass-strong transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                <div className="relative">
                  <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-primary/30 group-hover:ring-primary transition-all">
                    <AvatarImage src={c.image ?? undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-extrabold text-2xl">
                      {c.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mb-3">@{c.username}</p>

                  <div className="flex items-center justify-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="w-3 h-3" />
                      {c.storyCount} cerita
                    </span>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Lihat profil <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
