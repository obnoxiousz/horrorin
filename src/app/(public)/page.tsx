"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Flame,
  Sparkles,
  Clock,
  TrendingUp,
  ArrowRight,
  Ghost,
  PenTool,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StoryCard } from "@/components/story/story-card";
import { StoryRow } from "@/components/story/story-row";
import { CategoryPill } from "@/components/story/category-pill";
import {
  EmptyState,
  StoryCardSkeleton,
  ErrorState,
} from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/constants";
import { formatNumber } from "@/utils/format";
import { useSession } from "next-auth/react";
import { homeQueries, type HomeCreator } from "@/lib/api/home";

export default function HomePage() {
  const { data: session } = useSession();

  const {
    data: homeData,
    isLoading: homeLoading,
    isError,
    refetch,
  } = useQuery(homeQueries.all());

  useEffect(() => {
    document.title = "Horrorin — Komunitas Cerita Horror Indonesia";
  }, []);

  const trending = homeData?.trending ?? [];
  const latest = homeData?.latest ?? [];
  const recommended = homeData?.recommended ?? [];
  const categories = homeData?.categories ?? [];
  const creators = homeData?.creators ?? [];

  return (
    <AppShell>

      {/* ===== CATEGORIES ===== */}
      <section className="border-y border-border/40 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Jelajah Kategori
            </h2>
            <Link
              href="/kategori"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1 space-x-1 pb-2 -mx-4 px-4 scrollbar-thin">
            {CATEGORIES.map((c) => (
              <CategoryPill
                key={c.slug}
                category={{
                  slug: c.slug,
                  name: c.name,
                  icon: c.emoji,
                  color: c.color,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-10 space-y-16 animate-in fade-in duration-300">
        {/* ===== TRENDING ===== */}
        <section>
          <SectionHeader
            title="Lagi Trending Nih "
            subtitle="Cerita yang paling banyak dibahas minggu ini"
            icon={<Flame className="w-5 h-5 text-primary" />}
            href="/trending"
          />
          {homeLoading ? (
            <StoryRow>
              {[0, 1, 2, 3].map((i) => (
                <StoryCardSkeleton key={i} />
              ))}
            </StoryRow>
          ) : trending.length === 0 ? (
            <EmptyState
              title="Masih sepi nih..."
              description="Jadilah orang pertama yang bikin cerita! 👻"
              action={{ label: "Mulai Cerita Baru ", href: "/editor" }}
            />
          ) : (
            <StoryRow>
              {trending.slice(0, 4).map((s: any) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </StoryRow>
          )}
        </section>

        {/* ===== LATEST ===== */}
        <section>
          <SectionHeader
            title="Cerita Terbaru 🆕"
            subtitle="Fresh dari para kreator"
            icon={<Clock className="w-5 h-5 text-primary" />}
            href="/terbaru"
          />
          {homeLoading ? (
            <StoryRow>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <StoryCardSkeleton key={i} />
              ))}
            </StoryRow>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : latest.length === 0 ? (
            <EmptyState />
          ) : (
            <StoryRow>
              {latest.slice(0, 8).map((s: any) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </StoryRow>
          )}
        </section>

        {/* ===== CTA BANNER ===== */}
        <section className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 horror-gradient" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">
                Punya cerita serem yang keluar kepala?
              </h3>
              <p className="text-muted-foreground max-w-lg">
                Bagikan ke ribuan pembaca. Pilih template, edit konten,
                tayangin. Semudah posting story Instagram.
              </p>
            </div>
            <Link href={session ? "/editor" : "/gabung"}>
              <Button
                size="lg"
                className="gap-2 rounded-full bg-primary hover:bg-primary/90 font-bold h-12 px-8 whitespace-nowrap"
              >
                <PenTool className="w-5 h-5" />{" "}
                {session ? "Mulai Cerita Baru" : "Gabung Sekarang"}
              </Button>
            </Link>
          </div>
        </section>

        {/* ===== RECOMMENDED ===== */}
        <section>
          <SectionHeader
            title="Rekomendasi Buat Kamu ✨"
            subtitle="Berdasarkan yang paling banyak disimpan"
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
          />
          {homeLoading ? (
            <StoryRow>
              {[0, 1, 2, 3].map((i) => (
                <StoryCardSkeleton key={i} />
              ))}
            </StoryRow>
          ) : recommended.length === 0 ? (
            <EmptyState />
          ) : (
            <StoryRow>
              {recommended.slice(0, 4).map((s: any) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </StoryRow>
          )}
        </section>

        {/* ===== POPULAR CATEGORIES ===== */}
        {categories.length > 0 && (
          <section>
            <SectionHeader
              title="Kategori Populer 🎨"
              subtitle="Pilih topik favoritmu"
              icon={<Sparkles className="w-5 h-5 text-primary" />}
              href="/kategori"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.slice(0, 10).map((c: any) => {
                const count = c._count?.stories ?? 0;
                return (
                  <Link
                    key={c.id}
                    href={`/kategori/${c.slug}`}
                    className="group relative overflow-hidden rounded-2xl p-5 glass hover:glass-strong transition-all hover:-translate-y-1"
                    style={{
                      borderColor: c.color ? `${c.color}30` : undefined,
                    }}
                  >
                    <div
                      className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
                      style={{ backgroundColor: c.color ?? "#ef4444" }}
                    />
                    <div className="relative">
                      <div className="text-3xl mb-2">{c.icon ?? "👻"}</div>
                      <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                        {c.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(count)} cerita
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== POPULAR CREATORS ===== */}
        <section>
          <SectionHeader
            title="Kreator Paling Liris "
            subtitle="Sumber cerita serem favorit pembaca"
            icon={<Users className="w-5 h-5 text-primary" />}
            href="/kreator"
          />
          <HomeCreatorsRow creators={creators} />
        </section>
      </div>

      
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl" /> */}

        <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 animate-slide-up">
              {/* <Badge
                variant="outline"
                className="bg-primary/10 border-primary/30 text-primary"
              >
                <Sparkles className="w-3 h-3 mr-1" /> Komunitas Horror #1
                Indonesia
              </Badge> */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Bikin cerita{" "}
                <span className="text-primary text-glow">horror</span> kek pros. Tanpa design skill.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Pilih template kece, edit konten, tayangin ke ribuan pembaca.
                Horrorin gabungin Canva + Reddit + Medium buat para pencinta
                urban legend Indonesia.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {session ? (
                  <Link href="/editor">
                    <Button
                      size="lg"
                      className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-base font-bold h-12 px-6"
                    >
                      <PenTool className="w-5 h-5" /> Mulai Cerita Baru 
                    </Button>
                  </Link>
                ) : (
                  <Link href="/gabung">
                    <Button
                      size="lg"
                      className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-base font-bold h-12 px-6"
                    >
                      Gabung Horrorin
                    </Button>
                  </Link>
                )}
                <Link href="/trending">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 rounded-full h-12 px-6 font-semibold"
                  >
                    <Flame className="w-5 h-5 text-primary" /> Liat yang
                    Trending
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 pt-4">
                <Stat label="Cerita tayang" value="2.4K+" />
                <div className="w-px h-10 bg-border" />
                <Stat label="Kreator aktif" value="850+" />
                <div className="w-px h-10 bg-border" />
                <Stat label="Pembaca bulanan" value="120K+" />
              </div>
            </div>

            {/* Hero preview: stacked cards */}
            <div className="relative hidden lg:block h-[420px]">
              {trending[0] && (
                <StoryCard
                  story={trending[0]}
                  className="absolute top-0 left-0 w-72 rotate-[-6deg] hover:rotate-[-3deg] transition-transform duration-500"
                />
              )}
              {trending[1] && (
                <StoryCard
                  story={trending[1]}
                  className="absolute top-10 right-0 w-72 rotate-[4deg] hover:rotate-[2deg] transition-transform duration-500"
                />
              )}
              {/* {trending[2] && (
                <StoryCard
                  story={trending[2]}
                  className="absolute bottom-0 left-12 w-72 rotate-[2deg] hover:rotate-0 transition-transform duration-500"
                />
              )} */}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon,
  href,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Lihat semua <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function HomeCreatorsRow({ creators }: { creators: HomeCreator[] }) {
  if (creators.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl glass p-5 text-center animate-pulse"
          >
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3" />
            <div className="h-3 w-2/3 bg-muted rounded mx-auto mb-2" />
            <div className="h-2 w-1/2 bg-muted rounded mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {creators.map((c: any) => (
        <Link
          key={c.id}
          href={`/u/${c.username ?? c.id}`}
          className="group flex flex-col items-center text-center p-5 rounded-2xl glass hover:glass-strong transition-all hover:-translate-y-1"
        >
          <Avatar className="w-16 h-16 mb-3 ring-2 ring-primary/30 group-hover:ring-primary transition-all">
            <AvatarImage src={c.image ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
              {c.name?.charAt(0) ?? "H"}
            </AvatarFallback>
          </Avatar>
          <h4 className="font-semibold text-sm truncate w-full group-hover:text-primary transition-colors">
            {c.name}
          </h4>
          <p className="text-xs text-muted-foreground truncate w-full">
            @{c.username}
          </p>
        </Link>
      ))}
    </div>
  );
}
