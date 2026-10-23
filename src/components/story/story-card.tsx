"use client";

import Link from "next/link";
import { Heart, MessageCircle, Clock, Eye, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber, formatRelativeTime, readingTimeLabel, truncate } from "@/utils/format";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { storiesApi } from "@/lib/api/stories";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

interface StoryCardProps {
  story: any;
  variant?: "default" | "compact" | "horizontal" | "featured";
  className?: string;
}

export function StoryCard({ story, variant = "default", className }: StoryCardProps) {
  const [liked, setLiked] = useState<boolean>(story.liked ?? false);
  const [bookmarked, setBookmarked] = useState<boolean>(story.bookmarked ?? false);
  const [likeCount, setLikeCount] = useState<number>(story.likeCount ?? 0);
  const qc = useQueryClient();

  // Engagement mutates only this card's local state; nothing refetches on the
  // current page (refetchType "none" just marks caches stale — they refresh
  // on their next visit).
  const invalidateCounts = () => {
    qc.invalidateQueries({ queryKey: queryKeys.home.all, refetchType: "none" });
    qc.invalidateQueries({ queryKey: queryKeys.stories.lists(), refetchType: "none" });
    qc.invalidateQueries({ queryKey: queryKeys.stories.detail(story.slug), refetchType: "none" });
  };

  const onLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const d = await storiesApi.like(story.id);
      setLiked(d.liked);
      setLikeCount((c) => c + (d.liked ? 1 : -1));
      invalidateCounts();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401)
        toast.error("Masuk untuk menyukai cerita.");
    }
  };
  const onBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const d = await storiesApi.bookmark(story.id);
      setBookmarked(d.bookmarked);
      invalidateCounts();
      toast.success(d.bookmarked ? "Cerita disimpan." : "Cerita dihapus dari simpanan.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401)
        toast.error("Masuk untuk menyimpan cerita.");
    }
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
        "group relative block w-full aspect-[3/4] @container rounded-2xl overflow-hidden text-white md:hover:scale-[1.03] transition-transform duration-300",
        className
      )}
    >
      {/* Thumbnail */}
      {story.thumbnailUrl ? (
        <img
          src={story.thumbnailUrl}
          alt={story.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 horror-gradient flex items-center justify-center text-5xl">
          👻
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      {/* Hover tint */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/25 transition-colors duration-300" />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 flex items-start justify-between gap-2 p-3 pointer-events-none">
        {story.category ? (
          <Badge className="py-1 px-2 bg-primary/90 backdrop-blur border-0">
            <span className="mr-1">{story.category.icon}</span> {story.category.name}
          </Badge>
        ) : (
          <span />
        )}
        <div className="flex flex-col items-end gap-2">
          {variant === "featured" && (
            <Badge className="py-1 px-2 bg-amber-500/90 backdrop-blur border-0 text-black">
               Trending
            </Badge>
          )}
          {/* Bookmark button */}
          <button
            onClick={onBookmark}
            aria-label="Simpan cerita"
            className={cn(
              "pointer-events-auto w-7 h-7 rounded-full backdrop-blur flex items-center justify-center transition-all",
              bookmarked ? "bg-primary text-primary-foreground" : "bg-black/40 hover:bg-black/60"
            )}
          >
            <Bookmark className={cn("w-3.5 h-3.5", bookmarked && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Bottom block */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar className="w-5 h-5 shrink-0">
            <AvatarImage src={story.author?.image ?? undefined} />
            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
              {story.author?.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] font-medium text-white/80 truncate">
            {story.author?.name ?? story.author?.username}
          </span>
          <span className="text-[11px] text-white/50">·</span>
          <span className="text-[11px] text-white/60 shrink-0">
            {formatRelativeTime(story.publishedAt ?? story.createdAt)}
          </span>
        </div>

        <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2 text-white">
          {story.title}
        </h3>
        <p className="hidden @[220px]:block text-xs text-white/70 line-clamp-2">
          {story.excerpt ?? truncate(story.title, 100)}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-white/75">
          <span className="hidden @[220px]:flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" /> {readingTimeLabel(story.readingTime)}
          </span>
          <button
            onClick={onLike}
            className={cn(
              "flex items-center gap-1 transition-colors",
              liked ? "text-primary" : "hover:text-primary"
            )}
          >
            <Heart className={cn("w-3 h-3", liked && "fill-current")} /> {formatNumber(likeCount)}
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> {formatNumber(story.commentCount)}
          </span>
          <span className="hidden @[220px]:flex items-center gap-1 ml-auto shrink-0">
            <Eye className="w-3 h-3" /> {formatNumber(story.viewCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}
