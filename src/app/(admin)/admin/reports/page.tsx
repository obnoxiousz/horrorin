"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AdminNav } from "@/components/layout/admin-nav";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { useSession } from "next-auth/react";

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    document.title = "Laporan Komunitas — Admin Horrorin";
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/masuk?next=/admin/reports");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
    return (
      <AppShell>
        <LoadingState text="Lagi cek akses admin... 👀" variant="skeleton" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Flag className="w-7 h-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold">Laporan Komunitas</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Review laporan dari user soal cerita atau komen yang melanggar aturan.
          </p>
        </header>

        <AdminNav />

        <EmptyState
          title="Belum ada laporan masuk 👻"
          description="Mantap! Komunitas lagi sepi dari laporan. Cek lagi nanti ya."
          icon={<Flag className="w-10 h-10 text-primary" />}
        />
      </div>
    </AppShell>
  );
}
