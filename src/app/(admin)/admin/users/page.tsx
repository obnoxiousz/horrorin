"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Ban,
  CheckCircle2,
  Shield,
  ShieldCheck,
  Mail,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AdminNav } from "@/components/layout/admin-nav";
import { LoadingState } from "@/components/ui/states";
import { SkeletonList, SkeletonTable } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { formatDate, formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    document.title = "Kelola Users — Admin Horrorin";
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/masuk?next=/admin/users");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", debouncedSearch],
    queryFn: async () => {
      const qs = debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : "";
      const r = await fetch(`/api/admin/users${qs}`);
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    enabled: status === "authenticated" && session?.user?.role === "ADMIN",
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: { role?: string; banned?: boolean } }) => {
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
    onSuccess: (_d, vars) => {
      const isBan = vars.body.banned !== undefined;
      const isRole = vars.body.role !== undefined;
      if (isRole) {
        toast.success(vars.body.role === "ADMIN" ? "User dipromote jadi admin 🛡️" : "Admin diturunkan jadi user");
      } else if (isBan) {
        toast.success(vars.body.banned ? "User ke-ban 🔨" : "User unban ✅");
      }
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: () => toast.error("Gagal update user, coba lagi ya"),
  });

  if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
    return (
      <AppShell>
        <LoadingState text="Lagi cek akses admin... 👀" variant="skeleton" />
      </AppShell>
    );
  }

  const users = data?.users ?? [];

  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-7 h-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold">Kelola Users</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Cari, ban, atau promote jadi admin. Total {users.length} user terdaftar.
          </p>
        </header>

        <AdminNav />

        {/* ===== Search ===== */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/60"
          />
        </div>

        {/* ===== Desktop table ===== */}
        {isLoading ? (
          <>
            <div className="hidden lg:block glass rounded-3xl overflow-hidden">
              <SkeletonTable cols={7} rows={8} />
            </div>
            <div className="lg:hidden">
              <SkeletonList count={5} className="space-y-3" />
            </div>
          </>
        ) : users.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {debouncedSearch ? `Nggak ketemu user buat "${debouncedSearch}"` : "Belum ada user terdaftar 👻"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: table */}
            <div className="hidden lg:block glass rounded-3xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Cerita</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u: any) => (
                    <TableRow key={u.id} className={cn(u.banned && "opacity-60")}>
                      <TableCell>
                        <Link href={`/u/${u.username ?? u.id}`} className="flex items-center gap-3 group">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={u.image ?? undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                              {u.name?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                              {u.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {u.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        {u.role === "ADMIN" ? (
                          <Badge className="bg-primary/90 gap-1">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.banned ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="w-3 h-3" /> Banned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Aktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">{u._count?.stories ?? 0}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1.5">
                          {u.role === "ADMIN" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-8"
                              disabled={updateMutation.isPending || u.id === session.user.id}
                              onClick={() => updateMutation.mutate({ id: u.id, body: { role: "USER" } })}
                            >
                              <Shield className="w-3 h-3" /> Demote
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-8"
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ id: u.id, body: { role: "ADMIN" } })}
                            >
                              <ShieldCheck className="w-3 h-3" /> Promote
                            </Button>
                          )}
                          {u.banned ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-8 text-emerald-400"
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ id: u.id, body: { banned: false } })}
                            >
                              Unban
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full text-xs h-8 text-destructive"
                                  disabled={updateMutation.isPending || u.id === session.user.id}
                                >
                                  <Ban className="w-3 h-3" /> Ban
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-strong border-border/50">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Ban user ini?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    User <span className="font-semibold text-foreground">{u.name}</span> nggak akan bisa login lagi sampai di-unban. Yakin?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="rounded-full bg-destructive hover:bg-destructive/90"
                                    onClick={() => updateMutation.mutate({ id: u.id, body: { banned: true } })}
                                  >
                                    Ya, ban 🔨
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: cards */}
            <div className="lg:hidden space-y-3">
              {users.map((u: any) => (
                <div key={u.id} className={cn("glass rounded-2xl p-4", u.banned && "opacity-60")}>
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={u.image ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {u.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link href={`/u/${u.username ?? u.id}`} className="font-medium text-sm hover:text-primary transition-colors truncate block">
                        {u.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {u.role === "ADMIN" ? (
                      <Badge className="bg-primary/90 gap-1">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                    {u.banned ? (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="w-3 h-3" /> Banned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </Badge>
                    )}
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="w-3 h-3" /> {u._count?.stories ?? 0} cerita
                    </Badge>
                    <span className="text-xs text-muted-foreground">· {formatRelativeTime(u.createdAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    {u.role === "ADMIN" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full text-xs h-8"
                        disabled={updateMutation.isPending || u.id === session.user.id}
                        onClick={() => updateMutation.mutate({ id: u.id, body: { role: "USER" } })}
                      >
                        <Shield className="w-3 h-3" /> Demote
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full text-xs h-8"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: u.id, body: { role: "ADMIN" } })}
                      >
                        <ShieldCheck className="w-3 h-3" /> Promote
                      </Button>
                    )}
                    {u.banned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full text-xs h-8 text-emerald-400"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: u.id, body: { banned: false } })}
                      >
                        Unban
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-full text-xs h-8 text-destructive"
                            disabled={updateMutation.isPending || u.id === session.user.id}
                          >
                            <Ban className="w-3 h-3" /> Ban
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-strong border-border/50">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ban user ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                              User <span className="font-semibold text-foreground">{u.name}</span> nggak akan bisa login lagi. Yakin?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="rounded-full bg-destructive hover:bg-destructive/90"
                              onClick={() => updateMutation.mutate({ id: u.id, body: { banned: true } })}
                            >
                              Ya, ban 🔨
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
