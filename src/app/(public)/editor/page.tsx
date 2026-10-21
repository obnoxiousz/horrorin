"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Eye,
  Save,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/states";
import { TEMPLATES, type TemplateDef } from "@/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StoryEditor } from "@/components/editor/story-editor";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"select" | "edit">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDef | null>(null);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await fetch("/api/public/categories");
      return r.json();
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/masuk?next=/editor");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <AppShell><LoadingState text="Lagi nyiapin editor... 👀" /></AppShell>;
  }

  // ===== STEP 1: TEMPLATE GALLERY =====
  if (step === "select" || !selectedTemplate) {
    return (
      <AppShell>
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary mb-3">
              <Sparkles className="w-3 h-3 mr-1" /> Langkah 1 dari 2
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Pilih Template Favoritmu 🎨
            </h1>
            <p className="text-muted-foreground">
              Template adalah jimat Horrorin. Mau gaya Canva, Chat WA, Police File, atau Diary — tinggal pilih, kita auto-generate blok-nya buat kamu.
            </p>
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {TEMPLATES.map((tpl) => (
              <TemplateCard
                key={tpl.slug}
                template={tpl}
                onSelect={() => {
                  setSelectedTemplate(tpl);
                  setStep("edit");
                  toast.success(`Template "${tpl.name}" dipilih! 🎨`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ))}
          </div>

          {/* Info */}
          <div className="mt-12 p-6 rounded-3xl glass max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              💡 <span className="text-foreground font-medium">Tips:</span> Setiap template bisa kamu edit bebas — add, hapus, atau duplikat blok. Template cuma titik mulai, kamu yang ngatur cerita.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // ===== STEP 2: BLOCK EDITOR =====
  return (
    <StoryEditor
      template={selectedTemplate}
      categories={catData?.categories ?? []}
      onBack={() => {
        setStep("select");
        setSelectedTemplate(null);
      }}
    />
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: TemplateDef;
  onSelect: () => void;
}) {
  return (
    <div
      className="group relative flex flex-col rounded-3xl overflow-hidden glass hover:glass-strong transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
      style={{ borderColor: `${template.accent}30` }}
    >
      {/* Preview */}
      <div
        className="relative aspect-[4/3] overflow-hidden p-5"
        style={{
          background: `linear-gradient(135deg, ${template.accent}15, transparent)`,
        }}
      >
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative h-full flex flex-col gap-2 justify-center">
          {template.structure.map((b, i) => (
            <BlockPreview key={i} type={b.type} accent={template.accent} />
          ))}
        </div>
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center text-lg">
          {template.emoji}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">
          {template.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
          {template.description}
        </p>
        <Button
          onClick={onSelect}
          className="w-full gap-1.5 rounded-full font-semibold"
          style={{ backgroundColor: template.accent }}
        >
          Pake Ini <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function BlockPreview({ type, accent }: { type: string; accent: string }) {
  if (type === "text" || type === "diary" || type === "news") {
    return (
      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full bg-foreground/30" style={{ width: `${70 + Math.random() * 25}%` }} />
        <div className="h-1.5 rounded-full bg-foreground/20" style={{ width: `${50 + Math.random() * 30}%` }} />
      </div>
    );
  }
  if (type === "quote") {
    return (
      <div
        className="rounded-lg p-2 border-l-2 text-[10px] italic text-foreground/70"
        style={{ borderColor: accent }}
      >
        "Kutipan berkesan..."
      </div>
    );
  }
  if (type === "image" || type === "large-image" || type === "cover-image" || type === "gallery") {
    return (
      <div
        className="rounded-lg flex items-center justify-center text-[10px] text-foreground/50"
        style={{
          aspectRatio: type === "gallery" ? "1/1" : "16/9",
          backgroundColor: `${accent}25`,
          border: `1px solid ${accent}40`,
        }}
      >
        {type === "gallery" ? "🗂️ Galeri" : "🖼️ Gambar"}
      </div>
    );
  }
  if (type === "timeline") {
    return (
      <div className="space-y-1">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
            <div className="h-1 rounded-full bg-foreground/30 flex-1" />
          </div>
        ))}
      </div>
    );
  }
  if (type === "chat" || type === "conversation") {
    return (
      <div className="space-y-1">
        <div className="flex justify-start">
          <div className="h-3 rounded-lg bg-foreground/20" style={{ width: "55%" }} />
        </div>
        <div className="flex justify-end">
          <div className="h-3 rounded-lg" style={{ width: "45%", backgroundColor: `${accent}80` }} />
        </div>
      </div>
    );
  }
  if (type === "police" || type === "cctv" || type === "investigation") {
    return (
      <div
        className="rounded-md p-2 text-[10px] font-mono"
        style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}40` }}
      >
        <div className="font-bold mb-1" style={{ color: accent }}>{type.toUpperCase()}</div>
        <div className="space-y-0.5">
          <div className="h-1 rounded-full bg-foreground/30 w-3/4" />
          <div className="h-1 rounded-full bg-foreground/20 w-1/2" />
        </div>
      </div>
    );
  }
  return <div className="h-4 rounded bg-foreground/10" />;
}
