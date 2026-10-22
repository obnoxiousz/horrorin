"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Clock,
  Eye,
  Calendar,
  ArrowLeft,
  Send,
  Twitter,
  Facebook,
  Link as LinkIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StoryBlockRenderer } from "@/components/story/story-block-renderer";
import { StoryCard } from "@/components/story/story-card";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { SkeletonDetail } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  formatNumber,
  formatRelativeTime,
  formatDate,
  readingTimeLabel,
} from "@/utils/format";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const qc = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["story", slug],
    queryFn: async () => {
      const r = await fetch(`/api/public/stories/${slug}`);
      if (!r.ok) throw new Error("not found");
      return r.json();
    },
    retry: false,
  });

  const { data: relatedData } = useQuery({
    queryKey: ["related", slug],
    queryFn: async () => {
      const r = await fetch(`/api/public/stories/related/${slug}`);
      if (!r.ok) return { stories: [] };
      return r.json();
    },
  });

  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ["comments", slug],
    queryFn: async () => {
      const r = await fetch(`/api/public/comments/${data?.story?.id}`);
      if (!r.ok) return { comments: [] };
      return r.json();
    },
    enabled: !!data?.story?.id,
  });

  useEffect(() => {
    if (data?.story) {
      setLiked(data.story.liked ?? false);
      setBookmarked(data.story.bookmarked ?? false);
      setLikeCount(data.story.likeCount ?? 0);
    }
  }, [data]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/public/stories/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: data?.story?.id }),
      });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    onMutate: async () => {
      setLiked((v) => !v);
      setLikeCount((c) => c + (liked ? -1 : 1));
    },
    onSuccess: (d) => {
      setLiked(d.liked);
      setLikeCount((c) => c + (d.liked ? 1 : -1) - (liked ? 1 : -1) * -1);
    },
    onError: () => {
      setLiked((v) => !v);
      setLikeCount((c) => c + (liked ? 1 : -1));
      if (!session) toast.error("Login dulu yuk buat like 💔");
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/public/stories/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: data?.story?.id }),
      });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    onSuccess: (d) => {
      setBookmarked(d.bookmarked);
      toast.success(d.bookmarked ? "Disimpan! Baca nanti ya 📌" : "Dihapus dari simpanan");
    },
    onError: () => {
      if (!session) toast.error("Login dulu yuk buat simpan 📌");
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const r = await fetch(`/api/public/comments/${data?.story?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      toast.success("Komen terkirim! 💬");
    },
    onError: () => {
      if (!session) toast.error("Login dulu yuk buat komen 💬");
    },
  });

  if (isLoading) return <AppShell><SkeletonDetail /></AppShell>;
  if (isError || !data?.story) {
    return (
      <AppShell>
        <ErrorState
          title="Cerita nggak ketemu 👻"
          description="Mungkin kehapus, atau link-nya salah."
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  const story = data.story;
  const comments = commentsData?.comments ?? [];
  const related = relatedData?.stories ?? [];

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link disalin! Share ke temen yuk 🔗");
    }
  };

  return (
    <AppShell>
      <article className="pb-20 animate-in fade-in duration-300">
        {/* ===== Back button + breadcrumb ===== */}
        <div className="container mx-auto max-w-3xl px-4 pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Balik ke beranda
          </Link>
        </div>

        {/* ===== Header ===== */}
        <header className="container mx-auto max-w-3xl px-4 mt-4 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Link href={`/kategori/${story.category.slug}`}>
              <Badge className="bg-primary/90 hover:bg-primary">
                {story.category.icon} {story.category.name}
              </Badge>
            </Link>
            {story.template && (
              <Badge variant="outline" className="border-primary/40 text-primary">
                🎨 {story.template.name}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-4">
            {story.title}
          </h1>
          {story.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">{story.excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link href={`/u/${story.author.username ?? story.author.id}`} className="flex items-center gap-2 group">
              <Avatar className="w-9 h-9 ring-2 ring-transparent group-hover:ring-primary/40 transition-all">
                <AvatarImage src={story.author.image ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                  {story.author.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{story.author.name}</div>
                <div className="text-xs">@{story.author.username}</div>
              </div>
            </Link>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {formatDate(story.publishedAt ?? story.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {readingTimeLabel(story.readingTime)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {formatNumber(story.viewCount)} view
            </span>
          </div>
        </header>

        {/* ===== Thumbnail ===== */}
        {story.thumbnailUrl && (
          <div className="container mx-auto max-w-4xl px-4 mb-10">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-muted">
              { }
              <img
                src={story.thumbnailUrl}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        )}

        {/* ===== Content blocks ===== */}
        <div className="container mx-auto max-w-3xl px-4">
          <div className="space-y-6">
            {story.blocks.map((block: any) => (
              <StoryBlockRenderer key={block.id} type={block.type} data={typeof block.data === "string" ? JSON.parse(block.data) : block.data} />
            ))}
          </div>

          {/* Tags */}
          {story.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border/40">
              {story.tags.map((t: any) => (
                <Link
                  key={t.id}
                  href={`/cari?q=${encodeURIComponent(t.name)}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          {/* ===== Engagement bar ===== */}
          <div className="sticky bottom-4 mt-8 z-30">
            <div className="glass-strong rounded-full p-1.5 flex items-center justify-between gap-2 shadow-xl shadow-black/40 max-w-md mx-auto">
              <button
                onClick={() => likeMutation.mutate()}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-sm transition-all",
                  liked ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                )}
              >
                <Heart className={cn("w-4 h-4", liked && "fill-current")} />
                {formatNumber(likeCount)}
              </button>
              <button
                onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/10 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {formatNumber(story.commentCount)}
              </button>
              <button
                onClick={() => bookmarkMutation.mutate()}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-sm transition-all",
                  bookmarked ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                )}
              >
                <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
              </button>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/10 transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="glass-strong border-border/50">
                  <DialogHeader>
                    <DialogTitle>Share cerita ini 📣</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <ShareBtn label="Twitter" icon={<Twitter className="w-5 h-5" />} onClick={onShare} />
                    <ShareBtn label="Facebook" icon={<Facebook className="w-5 h-5" />} onClick={onShare} />
                    <ShareBtn label="Salin Link" icon={<LinkIcon className="w-5 h-5" />} onClick={onShare} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* ===== Author card ===== */}
          <div className="mt-12 p-6 rounded-3xl glass">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-primary/30">
                <AvatarImage src={story.author.image ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                  {story.author.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{story.author.name}</h3>
                  <Badge variant="outline" className="text-[10px]">Kreator</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">@{story.author.username}</p>
                {story.author.bio && <p className="text-sm text-foreground/80 leading-relaxed">{story.author.bio}</p>}
                <Link href={`/u/${story.author.username ?? story.author.id}`}>
                  <Button variant="outline" size="sm" className="mt-3 rounded-full">Lihat profil</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ===== Comments ===== */}
          <section id="comments" className="mt-12 scroll-mt-32">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Komen ({formatNumber(story.commentCount)})
            </h2>

            {/* Comment input */}
            <div className="mb-6">
              {session ? (
                <div className="flex gap-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={session.user?.image ?? undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                      {session.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Tambahin komentarmu..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="resize-none min-h-[80px] bg-background/60"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={() => {
                          if (!commentText.trim()) return;
                          commentMutation.mutate(commentText.trim());
                        }}
                        disabled={!commentText.trim() || commentMutation.isPending}
                        className="gap-1.5 rounded-full bg-primary"
                      >
                        <Send className="w-4 h-4" /> Kirim
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl glass text-center">
                  <p className="text-sm text-muted-foreground mb-3">Masuk dulu buat ikutan ngekomen 💬</p>
                  <Link href="/masuk">
                    <Button className="rounded-full bg-primary">Masuk dulu 👋</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">Belum ada komen. Jadilah yang pertama! 👻</p>
              ) : (
                comments.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={c.author.image ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                        {c.author.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="p-3 rounded-2xl bg-card/40">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{c.author.name}</span>
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ===== Related ===== */}
        {related.length > 0 && (
          <section className="container mx-auto max-w-7xl px-4 mt-16">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span className="text-primary">🔮</span> Cerita Serupa
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((s: any) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </section>
        )}
      </article>
    </AppShell>
  );
}

function ShareBtn({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl glass hover:glass-strong hover:text-primary transition-all"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
