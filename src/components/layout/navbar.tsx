"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Bell, Search, Menu, X, Plus, Ghost, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavbarVisibility } from "@/hooks/use-navbar-visibility";
import { useRouteTransition } from "@/components/ui/route-transition";
import { notificationQueries } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/query-keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/trending", label: "Trending" },
  { href: "/kategori", label: "Kategori" },
  { href: "/kreator", label: "Kreator" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const { start } = useRouteTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { isVisible, setHoverZoneActive, setLocked, isHoverCapable } =
    useNavbarVisibility();

  // Shared unread count across the app; refreshed once per navigation
  // (same cadence the old inline fetch effect had) and deduped by react-query.
  const { data: unreadData } = useQuery(
    notificationQueries.unread(status === "authenticated")
  );
  const unread = unreadData?.unread ?? 0;

  // Selama menu mobile / dropdown Radix open → navbar dikunci visible.
  useEffect(() => {
    setLocked(mobileOpen);
  }, [mobileOpen, setLocked]);

  useEffect(() => {
    if (status !== "authenticated") return;
    qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
  }, [status, pathname, qc]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    start();
    router.push(`/cari?q=${encodeURIComponent(searchValue.trim())}`);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Hover zone desktop-only: siretnya invisible, setengah lebar viewport atas,
          mouse di sini saat navbar hidden → navbar munculkan lagi. */}
      {isHoverCapable && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-1/2 z-40 h-20 w-[min(60vw,40rem)] -translate-x-1/2"
          onMouseEnter={() => setHoverZoneActive(true)}
          onMouseLeave={() => setHoverZoneActive(false)}
        />
      )}

      <header
        data-state={isVisible ? "visible" : "hidden"}
        className={cn(
          "fixed top-4 left-0 right-0 z-50 mx-auto w-fit max-w-[calc(100vw-2rem)] rounded-full",
          "glass-strong shadow-lg shadow-black/30 backdrop-blur-md backdrop-saturate-150",
          "transition-[translate,opacity] duration-300 ease-out",
          "motion-reduce:transition-opacity motion-reduce:translate-y-0",
          isVisible
            ? "opacity-100"
            : "-translate-y-[calc(100%+1rem)] opacity-0 pointer-events-none motion-reduce:translate-y-0"
        )}
        onMouseEnter={() => setHoverZoneActive(true)}
        onMouseLeave={() => setHoverZoneActive(false)}
        onFocus={() => setHoverZoneActive(true)}
        onBlur={() => setHoverZoneActive(false)}
        inert={isVisible ? undefined : true}
      >
        <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            {/* <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full group-hover:bg-primary/60 transition-colors" />
              <Ghost className="relative w-7 h-7 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Horror<span className="text-primary">in</span>
            </span> */}
            <Image src="/assets/logo.svg" alt="Horrorin Logo" width={100} height={100} />
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1 ml-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search (desktop) */}
          <form onSubmit={onSearch} className="hidden md:flex ml-auto w-40 lg:w-56 xl:w-64">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari cerita serem..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 h-9 bg-background/60 border-border/50 focus-visible:border-primary/50"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto md:ml-1">
            {status === "authenticated" ? (
              <>
                <Link href="/notifikasi" className="relative">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="w-5 h-5" />
                    {unread > 0 && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
                      >
                        {unread > 9 ? "9+" : unread}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/editor" className="hidden sm:block">
                  <Button className="gap-1.5 rounded-full bg-primary hover:bg-primary/90 font-semibold">
                    <Plus className="w-4 h-4" /> Posting Cerita
                  </Button>
                </Link>
                <DropdownMenu onOpenChange={(open) => setLocked(open)}>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={session.user?.image ?? undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {(session.user?.name ?? "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-strong border-border/50">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{session.user?.name}</span>
                        <span className="text-xs text-muted-foreground">{session.user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/u/${(session.user as any)?.username ?? "saya"}`} className="cursor-pointer">Profil Saya</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/simpan" className="cursor-pointer">
                        <Bookmark className="w-4 h-4 mr-2" /> Simpanan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/editor" className="cursor-pointer sm:hidden">
                        <Plus className="w-4 h-4 mr-2" /> Posting Cerita
                      </Link>
                    </DropdownMenuItem>
                    {(session.user as any)?.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-primary">Panel Admin</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive"
                      onClick={async () => {
                        const { signOut } = await import("next-auth/react");
                        signOut({ callbackUrl: "/" });
                        toast.success("Sampai jumpa lagi ");
                      }}
                    >
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : status === "unauthenticated" ? (
              <div className="flex items-center gap-2">
                <Link href="/masuk" className="hidden sm:block">
                  <Button variant="ghost" className="rounded-full">Masuk dulu </Button>
                </Link>
                <Link href="/gabung">
                  <Button className="rounded-full bg-primary hover:bg-primary/90 font-semibold">Gabung Horrorin</Button>
                </Link>
              </div>
            ) : null}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu: panel floating di bawah pill */}
        {mobileOpen && (
          <div className="absolute left-1/2 top-full mt-2 w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl glass-strong shadow-lg shadow-black/30 p-4 animate-fade-in">
            <form onSubmit={onSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari cerita serem..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-9 bg-background/60"
                />
              </div>
            </form>
            <nav aria-label="Menu mobile" className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium rounded-lg",
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {status === "authenticated" && (
                <Link
                  href="/editor"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2"
                >
                  <Button className="w-full gap-1.5 rounded-full bg-primary font-semibold">
                    <Plus className="w-4 h-4" /> Posting Cerita
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
