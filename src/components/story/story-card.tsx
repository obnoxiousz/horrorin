"use client";

import Link from "next/link";
import { Heart, MessageCircle, Clock, Eye, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber, formatRelativeTime, readingTimeLabel, truncate } from "@/utils/format";
import { useState } from "react";
import { toast } from "sonner";

interface StoryCardProps {
  story: any;
  variant?: "default" | "compact" | "horizontal" | "featured";
  className?: string;
}

export function StoryCard({ story, variant = "default", className }: StoryCardProps) {
  const [liked, setLiked] = useState<boolean>(story.liked ?? false);
  const [bookmarked, setBookmarked] = useState<boolean>(story.bookmarked ?? false);
  const [likeCount, setLikeCount] = useState<number>(story.likeCount ?? 0);

  const onLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const r = await fetch("/api/public/stories/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id }),
      });
      if (!r.ok) {
        if (r.status === 401) toast.error("Login dulu yuk buat like 💔");
        return;
      }
      const d = await r.json();
      setLiked(d.liked);
      setLikeCount((c) => c + (d.liked ? 1 : -1));
    } catch {}
  };
  const onBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const r = await fetch("/api/public/stories/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id }),
      });
      if (!r.ok) {
        if (r.status === 401) toast.error("Login dulu yuk buat simpan 📌");
        return;
      }
      const d = await r.json();
      setBookmarked(d.bookmarked);
      toast.success(d.bookmarked ? "Disimpan! Baca nanti ya 📌" : "Dihapus dari simpanan");
    } catch {}
  };

  if (variant === "horizontal") {
    return (
      <Link
        href={`/cerita/${story.slug}`}
        className={cn(
          "group flex gap-4 p-3 rounded-2xl glass hover:glass-strong transition-all",
          className
        )}
      >
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-muted">
          {story.thumbnailUrl ? (
             
            <img
              src={story.thumbnailUrl}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full horror-gradient flex items-center justify-center text-3xl">👻</div>
          )}
          {story.category && (
            <Badge className="absolute top-2 left-2 text-[10px] py-0.5 px-1.5 bg-primary/90 backdrop-blur">
              {story.category.icon} {story.category.name}
            </Badge>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar className="w-5 h-5">
              <AvatarImage src={story.author?.image ?? undefined} />
              <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                {story.author?.name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{story.author?.name}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(story.publishedAt ?? story.createdAt)}</span>
          </div>
          <h3 className="font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {story.title}
          </h3>
          {story.excerpt && (
            <p className="hidden sm:block text-sm text-muted-foreground mt-1 line-clamp-2">
              {truncate(story.excerpt, 120)}
            </p>
          )}
          <div className="flex items-center gap-3 mt-auto pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {readingTimeLabel(story.readingTime)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {formatNumber(likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> {formatNumber(story.commentCount)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/cerita/${story.slug}`}
        className="group flex flex-col p-3 rounded-xl glass hover:glass-strong transition-all"
      >
        <div className="flex items-start gap-2">
          {story.thumbnailUrl && (
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              { }
              <img src={story.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">{story.title}</h4>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(story.publishedAt ?? story.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // default / featured
  return (
    <Link
      href={`/cerita/${story.slug}`}
      className={cn(
        "group flex flex-col rounded-3xl overflow-hidden glass hover:glass-strong transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10",
        variant === "featured" && "sm:col-span-2 sm:row-span-2",
        className
      )}
    >
      {/* Thumbnail */}
      <div className={cn(
        "relative overflow-hidden bg-muted",
        variant === "featured" ? "aspect-[16/10]" : "aspect-video"
      )}>
        {story.thumbnailUrl ? (
           
          <img
            src={story.thumbnailUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full horror-gradient flex items-center justify-center text-6xl">👻</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/30 group-hover:bg-primary/40 transition-color duration-700" />
        {story.category && (
          <Badge className="absolute top-3 left-3 py-1 px-2 bg-primary/90 backdrop-blur border-0">
            <span className="mr-1">{story.category.icon}</span> {story.category.name}
          </Badge>
        )}
        {variant === "featured" && (
          <Badge className="absolute top-3 right-3 py-1 px-2 bg-amber-500/90 backdrop-blur border-0 text-black">
            🔥 Trending
          </Badge>
        )}

        {/* Bookmark button */}
        <button
          onClick={onBookmark}
          aria-label="Simpan cerita"
          className={cn(
            "absolute bottom-3 right-3 w-9 h-9 rounded-full backdrop-blur flex items-center justify-center transition-all",
            bookmarked ? "bg-primary text-primary-foreground" : "bg-black/40 hover:bg-black/60"
          )}
        >
          <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2.5">
          <Avatar className="w-6 h-6">
            <AvatarImage src={story.author?.image ?? undefined} />
            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
              {story.author?.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate">{story.author?.name ?? story.author?.username}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(story.publishedAt ?? story.createdAt)}</span>
        </div>

        <h3 className={cn(
          "font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1.5",
          variant === "featured" ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
        )}>
          {story.title}
        </h3>
        <p className={cn(
          "text-muted-foreground line-clamp-2 text-sm",
          variant === "featured" && "sm:text-base"
        )}>
          {story.excerpt ?? truncate(story.title, 100)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {readingTimeLabel(story.readingTime)}
            </span>
            <button
              onClick={onLike}
              className={cn(
                "flex items-center gap-1 transition-colors",
                liked ? "text-primary" : "hover:text-primary"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} /> {formatNumber(likeCount)}
            </button>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> {formatNumber(story.commentCount)}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5" /> {formatNumber(story.viewCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}
