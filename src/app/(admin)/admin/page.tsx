"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  FileText,
  FileEdit,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  Shield,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AdminNav } from "@/components/layout/admin-nav";
import { LoadingState } from "@/components/ui/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { formatNumber, formatRelativeTime } from "@/utils/format";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    document.title = "Admin Dashboard — Horrorin";
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/masuk?next=/admin");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users", "dashboard"],
    queryFn: async () => {
      const r = await fetch("/api/admin/users?take=1000");
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    enabled: status === "authenticated" && session?.user?.role === "ADMIN",
  });

  const { data: storiesData, isLoading: storiesLoading } = useQuery({
    queryKey: ["admin", "stories", "dashboard"],
    queryFn: async () => {
      const r = await fetch("/api/admin/stories");
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    enabled: status === "authenticated" && session?.user?.role === "ADMIN",
  });

  if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
    return (
      <AppShell>
        <LoadingState text="Lagi cek akses admin... 👀" />
      </AppShell>
    );
  }

  const users = usersData?.users ?? [];
  const stories = storiesData?.stories ?? [];
  const publishedCount = stories.filter((s: any) => s.status === "PUBLISHED").length;
  const draftCount = stories.filter((s: any) => s.status === "DRAFT").length;
  const archivedCount = stories.filter((s: any) => s.status === "ARCHIVED").length;
  const totalViews = stories.reduce((acc: number, s: any) => acc + (s.viewCount ?? 0), 0);
  const totalLikes = stories.reduce((acc: number, s: any) => acc + (s.likeCount ?? 0), 0);
  const totalComments = stories.reduce((acc: number, s: any) => acc + (s.commentCount ?? 0), 0);

  const isLoading = usersLoading || storiesLoading;
  const recentStories = [...stories]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* ===== Header ===== */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-7 h-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold">Dashboard Admin</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Halo <span className="font-semibold text-foreground">{session.user.name}</span>! Welcome ke panel admin Horrorin.
          </p>
        </header>

        <AdminNav />

        {isLoading ? (
          <LoadingState text="Lagi ngambil data... 👀" />
        ) : (
          <>
            {/* ===== Stat cards ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Users"
                value={users.length}
                icon={<Users className="w-5 h-5" />}
                color="#06b6d4"
                href="/admin/users"
              />
              <StatCard
                label="Total Cerita"
                value={stories.length}
                icon={<FileText className="w-5 h-5" />}
                color="#ef4444"
                href="/admin/stories"
              />
              <StatCard
                label="Published"
                value={publishedCount}
                icon={<Eye className="w-5 h-5" />}
                color="#84cc16"
              />
              <StatCard
                label="Drafts"
                value={draftCount}
                icon={<FileEdit className="w-5 h-5" />}
                color="#f59e0b"
              />
            </div>

            {/* ===== Secondary stats ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <MiniStat label="Total Views" value={totalViews} icon={<Eye className="w-4 h-4" />} />
              <MiniStat label="Total Likes" value={totalLikes} icon={<Heart className="w-4 h-4" />} />
              <MiniStat label="Total Komen" value={totalComments} icon={<MessageCircle className="w-4 h-4" />} />
            </div>

            {/* ===== Quick links + recent activity ===== */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quick links */}
              <div className="glass rounded-3xl p-6">
                <h2 className="font-bold text-lg mb-4">Quick Links</h2>
                <div className="space-y-2">
                  <QuickLink href="/admin/users" label="Kelola Users" desc={`${users.length} user terdaftar`} icon={<Users className="w-4 h-4" />} />
                  <QuickLink href="/admin/stories" label="Kelola Cerita" desc={`${stories.length} cerita total`} icon={<FileText className="w-4 h-4" />} />
                  <QuickLink href="/admin/reports" label="Laporan Komunitas" desc="Cek laporan masuk" icon={<AlertCircle className="w-4 h-4" />} />
                </div>
              </div>

              {/* Recent activity */}
              <div className="glass rounded-3xl p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Aktivitas Terbaru
                  </h2>
                  <Link
                    href="/admin/stories"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    Lihat semua <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {recentStories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Belum ada cerita 📭</p>
                ) : (
                  <div className="space-y-3">
                    {recentStories.map((s: any) => (
                      <Link
                        key={s.id}
                        href={`/cerita/${s.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/40 transition-colors"
                      >
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarImage src={s.author?.image ?? undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                            {s.author?.name?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{s.title}</p>
                          <p className="text-xs text-muted-foreground">
                            oleh {s.author?.name ?? "?"} · {formatRelativeTime(s.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={s.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  href?: string;
}) {
  const inner = (
    <div
      className="group relative overflow-hidden rounded-3xl p-5 glass hover:glass-strong transition-all hover:-translate-y-1"
      style={{ borderColor: `${color}30` }}
    >
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: color }}
      />
      <div className="relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: `${color}25`, color }}
        >
          {icon}
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold">{formatNumber(value)}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

function MiniStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold">{formatNumber(value)}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  desc,
  icon,
}: {
  href: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-accent/40 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PUBLISHED: { label: "Published", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    DRAFT: { label: "Draft", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    ARCHIVED: { label: "Archived", className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
  };
  const cfg = map[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}
