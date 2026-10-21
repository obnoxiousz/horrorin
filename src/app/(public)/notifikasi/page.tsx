"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Megaphone,
  BookOpen,
  CheckCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

export default function NotifikasiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    document.title = "Notifikasi — Horrorin";
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/masuk?next=/notifikasi");
    }
  }, [status, router]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const r = await fetch("/api/public/notifications");
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    enabled: status === "authenticated",
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/public/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Semua notifikasi udah dibaca ✅");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Gagal mark read, coba lagi ya"),
  });

  if (status === "loading" || status === "unauthenticated" || isLoading) {
    return (
      <AppShell>
        <LoadingState text="Lagi ngambil notifikasi... 👀" />
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

  const notifications = data?.notifications ?? [];
  const unread = data?.unread ?? 0;
  const filtered =
    filter === "unread"
      ? notifications.filter((n: any) => !n.read)
      : notifications;

  return (
    <AppShell>
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* ===== Header ===== */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Notifikasi
              </h1>
              <p className="text-sm text-muted-foreground">
                {unread > 0
                  ? `${unread} notifikasi belum dibaca`
                  : "Kamu udah baca semua 🎉"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-full glass p-1">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                  filter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-full transition-colors relative",
                  filter === "unread"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Belum dibaca
                {unread > 0 && filter !== "unread" && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            </div>

            {unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5"
                disabled={markAllReadMutation.isPending}
                onClick={() => markAllReadMutation.mutate()}
              >
                <CheckCheck className="w-4 h-4" />{" "}
                <span className="hidden sm:inline">Tandai dibaca</span>
              </Button>
            )}
          </div>
        </header>

        {/* ===== List ===== */}
        {filtered.length === 0 ? (
          <EmptyState
            title="Sepi nih... 👻"
            description={
              filter === "unread"
                ? "Nggak ada notifikasi belum dibaca. Mantap!"
                : "Belum ada notifikasi. Mulai interaksi sama cerita atau kreator lain biar dapet notif!"
            }
            icon={<Bell className="w-10 h-10 text-primary" />}
            action={{ label: "Jelajah cerita 🔥", href: "/trending" }}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((n: any) => (
              <NotifItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function NotifItem({ notification: n }: { notification: any }) {
  const icon = getIcon(n.type);
  const href = n.story
    ? `/cerita/${n.story.slug}`
    : n.actor
      ? `/u/${n.actor.username ?? n.actor.id}`
      : null;

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl transition-all",
        n.read ? "glass" : "glass-strong ring-1 ring-primary/20",
        href && "hover:ring-primary/40",
      )}
    >
      <div className="relative shrink-0">
        {n.actor ? (
          <Avatar className="w-10 h-10">
            <AvatarImage src={n.actor.image ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
              {n.actor.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
          {icon && <span className="text-[10px]">{getEmoji(n.type)}</span>}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold">{n.actor?.name ?? "Sistem"}</span>{" "}
          <span className="text-muted-foreground">{getActionText(n)}</span>{" "}
          {n.story && (
            <span className="font-medium text-primary">"{n.story.title}"</span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(n.createdAt)}
          </span>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </div>
      </div>

      {n.type === "FOLLOW" && n.actor && (
        <Link
          href={`/u/${n.actor.username ?? n.actor.id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <Button size="sm" variant="outline" className="rounded-full text-xs">
            Lihat
          </Button>
        </Link>
      )}
    </div>
  );

  if (href) {
    return <div className="block">{content}</div>;
  }
  return content;
}

function getIcon(type: string) {
  switch (type) {
    case "LIKE":
      return <Heart className="w-4 h-4 text-primary" />;
    case "COMMENT":
      return <MessageCircle className="w-4 h-4 text-primary" />;
    case "FOLLOW":
      return <UserPlus className="w-4 h-4 text-primary" />;
    case "STORY_PUBLISHED":
      return <BookOpen className="w-4 h-4 text-primary" />;
    case "SYSTEM":
      return <Megaphone className="w-4 h-4 text-primary" />;
    default:
      return <Bell className="w-4 h-4 text-primary" />;
  }
}

function getEmoji(type: string) {
  switch (type) {
    case "LIKE":
      return "❤️";
    case "COMMENT":
      return "💬";
    case "FOLLOW":
      return "➕";
    case "STORY_PUBLISHED":
      return "📖";
    case "SYSTEM":
      return "📢";
    default:
      return "🔔";
  }
}

function getActionText(n: any) {
  switch (n.type) {
    case "LIKE":
      return "nge-like ceritamu";
    case "COMMENT":
      return "ngomen di ceritamu";
    case "FOLLOW":
      return "mulai nge-follow kamu";
    case "STORY_PUBLISHED":
      return "baru aja publish cerita baru:";
    case "SYSTEM":
      return n.body ?? n.title;
    default:
      return n.body ?? "ada aktivitas baru";
  }
}
