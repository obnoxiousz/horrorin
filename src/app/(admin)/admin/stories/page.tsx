"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Archive,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AdminNav } from "@/components/layout/admin-nav";
import { LoadingState } from "@/components/ui/states";
import { SkeletonList, SkeletonTable } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { formatDate, formatNumber, formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { adminQueries, adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/query-keys";

export default function AdminStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    document.title = "Kelola Cerita — Admin Horrorin";
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/masuk?next=/admin/stories");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  const { data, isLoading } = useQuery(
    adminQueries.stories(status === "authenticated" && session?.user?.role === "ADMIN")
  );

  const archiveMutation = useMutation({
    mutationFn: (id: string) => adminApi.setStoryStatus(id, "ARCHIVED"),
    onSuccess: () => {
      toast.success("Cerita diarsipkan.");
      qc.invalidateQueries({ queryKey: queryKeys.admin.stories() });
    },
    onError: () => toast.error("Gagal mengarsipkan cerita."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteStory(id),
    onSuccess: () => {
      toast.success("Cerita dihapus.");
      qc.invalidateQueries({ queryKey: queryKeys.admin.stories() });
    },
    onError: () => toast.error("Gagal menghapus cerita."),
  });

  if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
    return (
      <AppShell>
        <LoadingState text="Memeriksa akses admin..." variant="skeleton" />
      </AppShell>
    );
  }

  const stories = data?.stories ?? [];

  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-7 h-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold">Kelola Cerita</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Total {stories.length} cerita. Bisa di-archive atau hapus permanen.
          </p>
        </header>

        <AdminNav />

        {isLoading ? (
          <>
            <div className="hidden lg:block glass rounded-3xl overflow-hidden">
              <SkeletonTable cols={8} rows={8} />
            </div>
            <div className="lg:hidden">
              <SkeletonList count={6} className="space-y-3" />
            </div>
          </>
        ) : stories.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <p className="text-sm text-muted-foreground">Belum ada cerita.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block glass rounded-3xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Likes</TableHead>
                    <TableHead className="text-center">Komentar</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stories.map((s: any) => (
                    <TableRow key={s.id} className={cn(s.status === "ARCHIVED" && "opacity-60")}>
                      <TableCell>
                        <Link
                          href={`/cerita/${s.slug}`}
                          className="font-medium text-sm hover:text-primary transition-colors flex items-center gap-1.5 group"
                        >
                          <span className="truncate max-w-xs group-hover:underline">{s.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                        {s.category && (
                          <span className="text-xs text-muted-foreground">{s.category.icon} {s.category.name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/u/${s.author?.username ?? s.author?.id}`}
                          className="flex items-center gap-2 group"
                        >
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={s.author?.image ?? undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                              {s.author?.name?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs group-hover:text-primary transition-colors truncate max-w-32">
                            {s.author?.name ?? "?"}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell className="text-center text-sm">{formatNumber(s.viewCount ?? 0)}</TableCell>
                      <TableCell className="text-center text-sm">{formatNumber(s.likeCount ?? 0)}</TableCell>
                      <TableCell className="text-center text-sm">{formatNumber(s.commentCount ?? 0)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(s.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1.5">
                          {s.status !== "ARCHIVED" ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full text-xs h-8"
                                  disabled={archiveMutation.isPending}
                                >
                                  <Archive className="w-3 h-3" /> Archive
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-strong border-border/50">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Archive cerita ini?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cerita <span className="font-semibold text-foreground">"{s.title}"</span> bakal di-hide dari publik. Bisa di-restore nanti.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="rounded-full"
                                    onClick={() => archiveMutation.mutate(s.id)}
                                  >
                                    Ya, archive 📦
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : null}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-xs h-8 text-destructive"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3" /> Hapus
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-strong border-border/50">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus permanen cerita ini?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cerita <span className="font-semibold text-foreground">"{s.title}"</span> akan dihapus permanen dan tidak dapat dipulihkan. Lanjutkan?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-full bg-destructive hover:bg-destructive/90"
                                  onClick={() => deleteMutation.mutate(s.id)}
                                >
                                  Ya, hapus 🗑️
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {stories.map((s: any) => (
                <div key={s.id} className={cn("glass rounded-2xl p-4", s.status === "ARCHIVED" && "opacity-60")}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      href={`/cerita/${s.slug}`}
                      className="font-medium text-sm hover:text-primary transition-colors flex-1 min-w-0"
                    >
                      <span className="line-clamp-2">{s.title}</span>
                    </Link>
                    <StatusBadge status={s.status} />
                  </div>

                  <Link
                    href={`/u/${s.author?.username ?? s.author?.id}`}
                    className="flex items-center gap-2 mb-3 group"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={s.author?.image ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                        {s.author?.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors truncate">
                      {s.author?.name ?? "?"}
                    </span>
                    <span className="text-xs text-muted-foreground">· {formatRelativeTime(s.createdAt)}</span>
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {formatNumber(s.viewCount ?? 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {formatNumber(s.likeCount ?? 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {formatNumber(s.commentCount ?? 0)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {s.status !== "ARCHIVED" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-full text-xs h-8"
                            disabled={archiveMutation.isPending}
                          >
                            <Archive className="w-3 h-3" /> Arsipkan
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-strong border-border/50">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Arsipkan cerita ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cerita tidak akan tampil kepada publik. Kamu bisa memulihkannya nanti.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="rounded-full"
                              onClick={() => archiveMutation.mutate(s.id)}
                            >
                              Ya, arsipkan
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-full text-xs h-8 text-destructive"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-strong border-border/50">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus permanen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cerita akan dihapus permanen dan tidak dapat dipulihkan. Lanjutkan?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-full bg-destructive hover:bg-destructive/90"
                            onClick={() => deleteMutation.mutate(s.id)}
                          >
                            Ya, hapus 🗑️
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PUBLISHED: { label: "Terbit", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    DRAFT: { label: "Draft", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    ARCHIVED: { label: "Diarsipkan", className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
  };
  const cfg = map[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}
