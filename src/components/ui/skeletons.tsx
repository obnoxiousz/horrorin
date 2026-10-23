import { StoryCardSkeleton } from "@/components/ui/states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export { StoryCardSkeleton as SkeletonCard };

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

function SkeletonStatus({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function SkeletonCardGrid({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <SkeletonStatus
      label="Memuat cerita..."
      className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </SkeletonStatus>
  );
}

export function SkeletonList({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <SkeletonStatus label="Memuat daftar..." className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl glass">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </SkeletonStatus>
  );
}

export function SkeletonTable({
  cols = 7,
  rows = 8,
  className,
}: {
  cols?: number;
  rows?: number;
  className?: string;
}) {
  const colKeys = Array.from({ length: Math.max(1, cols) });
  return (
    <SkeletonStatus label="Memuat data..." className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {colKeys.map((_, c) => (
              <TableHead key={c}>
                <Skeleton className="h-4 w-16 sm:w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: Math.max(1, rows) }).map((_, r) => (
            <TableRow key={r}>
              {colKeys.map((_, c) =>
                c === 0 ? (
                  <TableCell key={c}>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                ) : (
                  <TableCell key={c}>
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SkeletonStatus>
  );
}

export function SkeletonDetail() {
  return (
    <SkeletonStatus label="Memuat cerita..." className="pb-20">
      <article>
        <div className="container mx-auto max-w-3xl px-4 pt-6">
          <Skeleton className="h-4 w-32" />
        </div>

        <header className="container mx-auto max-w-3xl px-4 mt-4 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-10 sm:h-12 w-full max-w-xl mb-2" />
          <Skeleton className="h-10 sm:h-12 w-2/3 mb-5" />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </header>

        <div className="container mx-auto max-w-4xl px-4 mb-10">
          <div className="aspect-video rounded-3xl overflow-hidden bg-muted animate-pulse" />
        </div>

        <div className="container mx-auto max-w-3xl px-4">
          <div className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="mt-12 p-6 rounded-3xl glass">
            <div className="flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full max-w-md" />
                <Skeleton className="h-8 w-28 rounded-full mt-2" />
              </div>
            </div>
          </div>

          <section className="mt-12">
            <div className="flex items-center gap-2 mb-5">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="mb-6 flex gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-end">
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 p-3 rounded-2xl bg-card/40">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                    <Skeleton className="h-3.5 w-full max-w-md" />
                    <Skeleton className="h-3.5 w-2/3 mt-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </SkeletonStatus>
  );
}

export function SkeletonForm({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <SkeletonStatus label="Memuat formulir..." className={cn("space-y-5", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </SkeletonStatus>
  );
}

export function SkeletonProfile() {
  return (
    <SkeletonStatus label="Memuat profil...">
      <header className="relative overflow-hidden border-b border-border/40">
        <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-primary/40 ring-offset-4 ring-offset-background shrink-0" />
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <Skeleton className="h-8 sm:h-9 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
              <Skeleton className="h-3.5 w-full max-w-md mx-auto sm:mx-0" />
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Skeleton className="h-9 w-full sm:w-32 rounded-full" />
              <Skeleton className="h-9 w-full sm:w-40 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <Skeleton className="h-9 w-40 rounded-full mb-6" />
        <SkeletonCardGrid count={8} />
      </div>
    </SkeletonStatus>
  );
}

export function SkeletonStats({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <SkeletonStatus
      label="Memuat statistik..."
      className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl p-5 glass">
          <Skeleton className="w-10 h-10 rounded-xl mb-3" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </SkeletonStatus>
  );
}

export function SkeletonPageHeader({ className }: { className?: string }) {
  return (
    <SkeletonStatus label="Memuat halaman..." className={cn("flex items-center gap-3", className)}>
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3.5 w-64 max-w-full" />
      </div>
    </SkeletonStatus>
  );
}
