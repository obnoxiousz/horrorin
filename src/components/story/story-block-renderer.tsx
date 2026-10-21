"use client";

import { StoryBlockData } from "@/types";
import { Quote, ImageOff, Clock, MapPin, User, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryBlockRendererProps {
  type: string;
  data: StoryBlockData;
  className?: string;
}

export function StoryBlockRenderer({ type, data, className }: StoryBlockRendererProps) {
  const wrap = (children: React.ReactNode) => (
    <div className={cn("story-block animate-fade-in", className)}>{children}</div>
  );

  switch (type) {
    case "text":
      return wrap(
        <div
          className={cn(
            "text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap",
            data.align === "center" && "text-center",
            data.align === "right" && "text-right"
          )}
          style={{
            fontSize: data.fontSize === "sm" ? "0.95rem" : data.fontSize === "lg" ? "1.15rem" : data.fontSize === "xl" ? "1.3rem" : undefined,
            color: data.color,
          }}
        >
          {data.text}
        </div>
      );

    case "image":
    case "large-image":
    case "cover-image":
      return wrap(
        <figure className="space-y-2">
          <div className={cn(
            "relative rounded-2xl overflow-hidden bg-muted",
            type === "large-image" || type === "cover-image" ? "aspect-[16/10]" : "aspect-video"
          )}>
            {data.imageUrl ? (
               
              <img
                src={data.imageUrl}
                alt={data.caption ?? "Story image"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full horror-gradient flex items-center justify-center">
                <ImageOff className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          {data.caption && (
            <figcaption className="text-xs sm:text-sm text-muted-foreground text-center italic px-4">
              {data.caption}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return wrap(
        <blockquote className="relative my-6 p-6 sm:p-8 rounded-3xl horror-gradient border-l-4 border-primary">
          <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/30" />
          <p className="text-lg sm:text-xl font-medium leading-relaxed italic text-foreground">
            "{data.text}"
          </p>
          {data.author && (
            <footer className="mt-3 text-sm text-muted-foreground font-semibold">
              — {data.author}
            </footer>
          )}
        </blockquote>
      );

    case "gallery":
      return wrap(
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(data.images ?? []).map((img, i) => (
            <figure key={i} className="space-y-1.5">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                { }
                <img src={img.url} alt={img.caption ?? ""} className="w-full h-full object-cover" loading="lazy" />
              </div>
              {img.caption && (
                <figcaption className="text-xs text-muted-foreground text-center">{img.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      );

    case "timeline":
      return wrap(
        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/50 before:to-transparent">
          {(data.timeline ?? []).map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.35rem] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="text-xs font-bold text-primary mb-1">{item.time}</div>
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      );

    case "chat":
    case "conversation":
      return wrap(
        <div className="space-y-2 my-4">
          <div className="text-xs text-center text-muted-foreground mb-2">
            {data.datetime ?? "Percakapan"}
          </div>
          {(data.messages ?? []).map((m, i) => {
            const isMe = m.from === "me" || m.from === "A";
            return (
              <div key={i} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border/50 rounded-bl-sm"
                )}>
                  {!isMe && m.name && (
                    <div className="text-[10px] font-bold text-primary mb-0.5">{m.name}</div>
                  )}
                  <p className="text-sm leading-snug whitespace-pre-wrap">{m.text}</p>
                  {m.time && <div className="text-[10px] opacity-60 text-right mt-0.5">{m.time}</div>}
                </div>
              </div>
            );
          })}
        </div>
      );

    case "news":
    case "police":
    case "cctv":
    case "investigation":
      return wrap(
        <ReportBlock type={type} data={data} />
      );

    case "diary":
      return wrap(
        <div className="my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/30 to-stone-950/30 border border-amber-900/30">
          <div className="flex items-center gap-2 mb-4 text-amber-600">
            <User className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{data.observedBy ?? "Diary"}</span>
            {data.datetime && <span className="text-xs text-muted-foreground ml-auto">{data.datetime}</span>}
          </div>
          <div className="space-y-4">
            {(data.paragraphs ?? []).map((p, i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-amber-600/30 flex items-center justify-center text-[10px] font-bold text-amber-500">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 italic font-serif">{p}</p>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return wrap(
        <div className="p-4 rounded-xl bg-muted/20 text-sm text-muted-foreground">
          Block tipe "{type}" belum dikenal.
        </div>
      );
  }
}

function ReportBlock({ type, data }: { type: string; data: StoryBlockData }) {
  const config = {
    news: {
      label: "BERITA",
      color: "from-sky-900/40 to-slate-900/40",
      border: "border-sky-700/40",
      text: "text-sky-400",
      icon: "📺",
    },
    police: {
      label: "POLICE CASE FILE",
      color: "from-blue-950/40 to-slate-950/40",
      border: "border-blue-800/40",
      text: "text-blue-400",
      icon: "🚔",
    },
    cctv: {
      label: "CCTV FOOTAGE",
      color: "from-violet-950/40 to-slate-950/40",
      border: "border-violet-800/40",
      text: "text-violet-400",
      icon: "📹",
    },
    investigation: {
      label: "INVESTIGATION REPORT",
      color: "from-rose-950/40 to-slate-950/40",
      border: "border-rose-800/40",
      text: "text-rose-400",
      icon: "🔍",
    },
  }[type] ?? {
    label: "REPORT",
    color: "from-slate-900/40 to-slate-950/40",
    border: "border-slate-700/40",
    text: "text-slate-400",
    icon: "📋",
  };

  return (
    <div className={cn("my-6 rounded-3xl border overflow-hidden", config.border)}>
      {/* Header */}
      <div className={cn("bg-gradient-to-r p-4 sm:p-5", config.color)}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <span className={cn("text-xs font-bold tracking-wider", config.text)}>{config.label}</span>
          </div>
          {data.caseNumber && (
            <span className={cn("text-xs font-mono", config.text)}>{data.caseNumber}</span>
          )}
        </div>
        {data.classification && (
          <div className={cn("mt-2 text-[10px] font-bold uppercase tracking-widest", config.text)}>
            {data.classification}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {data.location && (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-muted-foreground">Lokasi</div>
                <div className="font-semibold">{data.location}</div>
              </div>
            </div>
          )}
          {data.datetime && (
            <div className="flex items-start gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-muted-foreground">Waktu</div>
                <div className="font-semibold">{data.datetime}</div>
              </div>
            </div>
          )}
          {data.observedBy && (
            <div className="flex items-start gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-muted-foreground">Pelapor</div>
                <div className="font-semibold">{data.observedBy}</div>
              </div>
            </div>
          )}
        </div>

        {/* Readings */}
        {data.readings && data.readings.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.readings.map((r, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl p-2.5 border text-center",
                  r.status === "critical" && "border-rose-500/40 bg-rose-950/30",
                  r.status === "warning" && "border-amber-500/40 bg-amber-950/30",
                  (!r.status || r.status === "normal") && "border-border/50 bg-card/40"
                )}
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{r.label}</div>
                <div className={cn(
                  "text-sm font-bold mt-0.5",
                  r.status === "critical" && "text-rose-400",
                  r.status === "warning" && "text-amber-400"
                )}>
                  {r.value}
                </div>
                {r.status === "critical" && <AlertTriangle className="w-3 h-3 text-rose-400 mx-auto mt-1" />}
              </div>
            ))}
          </div>
        )}

        {/* Body paragraphs */}
        {(data.paragraphs ?? []).length > 0 && (
          <div className="space-y-2 mt-3 pt-3 border-t border-border/30">
            {(data.paragraphs ?? []).map((p, i) => (
              <div key={i} className="flex gap-2 text-sm leading-relaxed">
                <Activity className={cn("w-3.5 h-3.5 mt-1 shrink-0", config.text)} />
                <p className="text-foreground/85">{p}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
