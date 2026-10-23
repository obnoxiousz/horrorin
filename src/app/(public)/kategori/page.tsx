"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Palette, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { formatNumber } from "@/utils/format";
import { categoryQueries } from "@/lib/api/categories";

export default function KategoriPage() {
  useEffect(() => {
    document.title = "Jelajah Kategori — Horrorin";
  }, []);

  const { data, isLoading, isError, refetch } = useQuery(categoryQueries.all());

  const categories = data?.categories ?? [];

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
              <Palette className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Jelajah Kategori
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Pilih topik favoritmu. Dari urban legend, rumah angker, sampai ritual yang bikin merinding.
              </p>
            </div>
          </div>
        </header>

        {/* ===== Grid ===== */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-3xl glass animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : categories.length === 0 ? (
          <EmptyState
            title="Belum ada kategori"
            description="Kategori gagal dimuat. Coba lagi nanti."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c: any) => {
              const count = c._count?.stories ?? 0;
              const color = c.color ?? "#ef4444";
              return (
                <Link
                  key={c.id}
                  href={`/kategori/${c.slug}`}
                  className="group relative overflow-hidden rounded-3xl p-5 sm:p-6 glass hover:glass-strong transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ borderColor: `${color}30` }}
                >
                  <div
                    className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity"
                    style={{ backgroundColor: color }}
                  />
                  <div className="relative">
                    <div className="text-4xl sm:text-5xl mb-3">{c.icon ?? "👻"}</div>
                    <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {formatNumber(count)} cerita
                    </p>
                    <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Jelajah <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
