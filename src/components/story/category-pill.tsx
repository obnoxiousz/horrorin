"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryPillProps {
  category: { slug: string; name: string; icon?: string | null; color?: string | null };
  active?: boolean;
  size?: "sm" | "md";
}

export function CategoryPill({ category, active, size = "md" }: CategoryPillProps) {
  return (
    <Link
      href={`/kategori/${category.slug}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border/50 bg-card/40 hover:border-primary/40 hover:bg-primary/10"
      )}
      style={active ? {} : { borderColor: category.color ? `${category.color}40` : undefined }}
    >
      {category.icon && <span>{category.icon}</span>}
      <span className="font-medium">{category.name}</span>
    </Link>
  );
}

export function CategoryPillButton({
  category,
  active,
  onClick,
  size = "md",
}: {
  category: { slug: string; name: string; icon?: string | null; color?: string | null };
  active?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border/50 bg-card/40 hover:border-primary/40 hover:bg-primary/10"
      )}
    >
      {category.icon && <span>{category.icon}</span>}
      <span className="font-medium">{category.name}</span>
    </button>
  );
}
