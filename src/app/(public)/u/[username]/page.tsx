"use client";

import { use, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  UserPlus,
  UserCheck,
  PenTool,
  Ghost,
  FileEdit,
  Pencil,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StoryCard } from "@/components/story/story-card";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { SkeletonProfile } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { formatDate, formatNumber } from "@/utils/format";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "", image: "", username: "" });

  const isOwn = session?.user?.username === username;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const r = await fetch(`/api/public/profile/${username}`);
      if (!r.ok) throw new Error("not found");
      return r.json();
    },
    retry: false,
  });

  const { data: myStoriesData } = useQuery({
    queryKey: ["my-stories", username],
    queryFn: async () => {
      const r = await fetch("/api/public/stories/me");
      if (!r.ok) return { stories: [] };
      return r.json();
    },
    enabled: isOwn && status === "authenticated",
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/public/profile/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: data?.profile?.id }),
      });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    onSuccess: (d) => {
      toast.success(d.following ? "Kamu mulai nge-follow 💀" : "Berhasil unfollow");
      qc.invalidateQueries({ queryKey: ["profile", username] });
    },
    onError: () => {
      if (status !== "authenticated") {
        toast.error("Login dulu yuk buat follow 💔");
        router.push("/masuk?next=/u/" + username);
      } else {
        toast.error("Gagal follow, coba lagi ya");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: any) => {
      const r = await fetch("/api/public/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Profil ke-update! ✨");
      setEditOpen(false);
      qc.invalidateQueries({ queryKey: ["profile", username] });
    },
    onError: () => {
      toast.error("Gagal update profil, coba lagi ya");
    },
  });

  useEffect(() => {
    if (data?.profile) {
      document.title = `${data.profile.name ?? username} — Horrorin`;
    }
  }, [data, username]);

  useEffect(() => {
    if (isOwn && data?.profile) {
      setEditForm({
        name: data.profile.name ?? "",
        bio: data.profile.bio ?? "",
        image: data.profile.image ?? "",
        username: data.profile.username ?? "",
      });
    }
  }, [isOwn, data]);

  if (isLoading) return <AppShell><SkeletonProfile /></AppShell>;
  if (isError || !data?.profile) {
    return (
      <AppShell>
        <ErrorState
          title="Profil nggak ketemu 👻"
          description="Mungkin username salah, atau akunnya udah kehapus."
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  const profile = data.profile;
  const publishedStories = data.stories ?? [];
  const myDrafts = (myStoriesData?.stories ?? []).filter((s: any) => s.status === "DRAFT");

  const onSaveEdit = () => {
    updateMutation.mutate({
      name: editForm.name,
      bio: editForm.bio,
      image: editForm.image || null,
      username: editForm.username,
    });
  };

  return (
    <AppShell>
      <div className="animate-in fade-in duration-300">
      {/* ===== Header ===== */}
      <header className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 horror-gradient opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 ring-4 ring-primary/40 ring-offset-4 ring-offset-background">
              <AvatarImage src={profile.image ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-extrabold text-4xl">
                {profile.name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold truncate">{profile.name}</h1>
                {profile.role === "ADMIN" && (
                  <Badge className="bg-primary/90 border-0 gap-1">
                    <Ghost className="w-3 h-3" /> Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">@{profile.username}</p>

              {profile.bio && (
                <p className="text-foreground/90 leading-relaxed mb-4 max-w-2xl">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Gabung {formatDate(profile.createdAt)}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
                <Stat label="Cerita" value={profile.storiesCount} />
                <Stat label="Followers" value={profile.followersCount} />
                <Stat label="Following" value={profile.followingCount} />
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {isOwn ? (
                <>
                  <Button
                    variant="outline"
                    className="rounded-full gap-2"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="w-4 h-4" /> Edit Profil
                  </Button>
                  <Link href="/editor">
                    <Button className="w-full rounded-full bg-primary gap-2">
                      <PenTool className="w-4 h-4" /> Posting Cerita
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  className="rounded-full gap-2 min-w-32"
                  variant={profile.isFollowing ? "outline" : "default"}
                  disabled={followMutation.isPending}
                  onClick={() => followMutation.mutate()}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===== Tabs ===== */}
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <Tabs defaultValue="cerita">
          <TabsList className="bg-card/40">
            <TabsTrigger value="cerita" className="gap-1.5">
              <FileEdit className="w-4 h-4" /> Cerita
            </TabsTrigger>
            {isOwn && (
              <TabsTrigger value="draft" className="gap-1.5">
                <PenTool className="w-4 h-4" /> Draft
                {myDrafts.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">{myDrafts.length}</Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="cerita" className="mt-6">
            {publishedStories.length === 0 ? (
              <EmptyState
                title={isOwn ? "Belum ada cerita nih 👻" : "Belum ada cerita published"}
                description={isOwn ? "Mulai tulis cerita pertamamu dan tayangin ke ribuan pembaca!" : `${profile.name} belum publish cerita apa-apa.`}
                action={isOwn ? { label: "Mulai Cerita Baru ✍️", href: "/editor" } : undefined}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {publishedStories.map((s: any) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            )}
          </TabsContent>

          {isOwn && (
            <TabsContent value="draft" className="mt-6">
              {myDrafts.length === 0 ? (
                <EmptyState
                  title="Belum ada draft nih 📝"
                  description="Mulai nulis dan save sebagai draft. Bisa diterusin kapan aja!"
                  action={{ label: "Mulai Cerita Baru ✍️", href: "/editor" }}
                />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myDrafts.map((s: any) => (
                    <DraftCard key={s.id} story={s} />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* ===== Edit Dialog ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="glass-strong border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profil ✨</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-background/60"
                placeholder="Nama tampilan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editForm.username}
                onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
                className="bg-background/60"
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">URL Foto Profil</Label>
              <Input
                id="edit-image"
                value={editForm.image}
                onChange={(e) => setEditForm((f) => ({ ...f, image: e.target.value }))}
                className="bg-background/60"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editForm.bio}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                className="bg-background/60 resize-none min-h-[80px]"
                placeholder="Cerita dikit tentang kamu..."
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">{editForm.bio.length}/200</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full">Batal</Button>
            </DialogClose>
            <Button
              onClick={onSaveEdit}
              disabled={updateMutation.isPending}
              className="rounded-full bg-primary gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Lagi simpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-lg font-extrabold">{formatNumber(value)}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function DraftCard({ story }: { story: any }) {
  return (
    <Link
      href={`/editor?edit=${story.id}`}
      className="group flex flex-col rounded-3xl overflow-hidden glass hover:glass-strong transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-video bg-muted flex items-center justify-center text-4xl">
        {story.thumbnailUrl ? (
          <img src={story.thumbnailUrl} alt={story.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full horror-gradient flex items-center justify-center">📝</div>
        )}
        <Badge className="absolute top-3 left-3 bg-amber-500/90 border-0 text-black">
          ✍️ Draft
        </Badge>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {story.title || "(Tanpa judul)"}
        </h3>
        {story.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{story.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            Diedit {formatDate(story.updatedAt)}
          </span>
          <span className="text-xs text-primary font-medium">Lanjutin nulis →</span>
        </div>
      </div>
    </Link>
  );
}
