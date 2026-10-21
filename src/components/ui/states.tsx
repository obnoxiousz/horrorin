import Link from "next/link";
import { Ghost } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({
  title = "Yah... belum ada cerita nih 👻",
  description = "Jadilah orang pertama yang bikin cerita di sini!",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4", className)}>
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative w-20 h-20 rounded-full glass flex items-center justify-center">
          {icon ?? <Ghost className="w-10 h-10 text-primary" />}
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

export function ErrorState({
  title = "Yah... ada yang error nih",
  description = "Coba refresh halaman, atau balik lagi nanti.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-5 text-3xl">
        💀
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function StoryCardSkeleton({ variant = "default" }: { variant?: "default" | "horizontal" }) {
  if (variant === "horizontal") {
    return (
      <div className="flex gap-4 p-3 rounded-2xl glass animate-pulse">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 w-1/2 bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-1/3 bg-muted rounded" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col rounded-3xl overflow-hidden glass animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/2 bg-muted rounded" />
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-2/3 bg-muted rounded" />
        <div className="h-8 w-full bg-muted rounded mt-4" />
      </div>
    </div>
  );
}

export function LoadingState({ text = "Lagi nyiapin cerita... 👀" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
