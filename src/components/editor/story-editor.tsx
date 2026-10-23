"use client";

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  Send,
  ImagePlus,
  Type,
  Quote as QuoteIcon,
  GalleryHorizontalEnd,
  Clock,
  MessageSquare,
  Newspaper,
  Shield,
  Video,
  Search,
  BookOpen,
  MessagesSquare,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { StoryBlockRenderer } from "@/components/story/story-block-renderer";
import { type TemplateDef, type BlockType } from "@/constants";
import { type StoryBlockData } from "@/types";
import { slugify, truncate } from "@/utils/format";
import { storiesApi } from "@/lib/api/stories";
import { uploadApi } from "@/lib/api/upload";
import { ApiError } from "@/lib/api/client";

interface Block {
  id: string;
  type: BlockType;
  data: StoryBlockData;
}

export interface EditorDraftStory {
  id: string;
  title: string;
  excerpt?: string | null;
  categoryId: string;
  thumbnailUrl?: string | null;
  tags?: { name: string }[];
  template?: { id: string; slug: string; name: string } | null;
  blocks: { type: string; data: string | object }[];
}

interface StoryEditorProps {
  template: TemplateDef;
  categories: any[];
  onBack: () => void;
  initialStory?: EditorDraftStory | null;
}

const BLOCK_TYPES: {
  type: BlockType;
  label: string;
  icon: any;
  desc: string;
}[] = [
  { type: "text", label: "Teks", icon: Type, desc: "Paragraf biasa" },
  { type: "image", label: "Gambar", icon: ImagePlus, desc: "Gambar tunggal" },
  {
    type: "large-image",
    label: "Gambar Besar",
    icon: ImagePlus,
    desc: "Gambar lebar full",
  },
  {
    type: "cover-image",
    label: "Cover",
    icon: ImagePlus,
    desc: "Cover image 16:10",
  },
  { type: "quote", label: "Kutipan", icon: QuoteIcon, desc: "Quote dramatic" },
  {
    type: "gallery",
    label: "Galeri",
    icon: GalleryHorizontalEnd,
    desc: "Beberapa gambar",
  },
  { type: "timeline", label: "Timeline", icon: Clock, desc: "Urutan kejadian" },
  {
    type: "chat",
    label: "Chat WA",
    icon: MessageSquare,
    desc: "Style chat WhatsApp",
  },
  {
    type: "conversation",
    label: "Conversation",
    icon: MessagesSquare,
    desc: "Obrolan 2 arah",
  },
  { type: "news", label: "News Report", icon: Newspaper, desc: "Gaya berita" },
  { type: "police", label: "Police File", icon: Shield, desc: "Kasus polisi" },
  { type: "cctv", label: "CCTV", icon: Video, desc: "Laporan CCTV" },
  {
    type: "investigation",
    label: "Investigation",
    icon: Search,
    desc: "Laporan investigasi",
  },
  { type: "diary", label: "Diary", icon: BookOpen, desc: "Buku harian" },
];

const genId = () => Math.random().toString(36).slice(2, 11);

const defaultDataFor = (type: BlockType): StoryBlockData => {
  switch (type) {
    case "text":
      return {
        text: "Tulis ceritamu di sini...",
        align: "left",
        fontSize: "md",
      };
    case "image":
    case "large-image":
    case "cover-image":
      return { imageUrl: "", caption: "" };
    case "quote":
      return { text: "Kutipan serammu di sini...", author: "Anonim" };
    case "gallery":
      return { images: [{ url: "", caption: "" }] };
    case "timeline":
      return {
        timeline: [
          { time: "00:00", title: "Judul", description: "Deskripsi kejadian" },
        ],
      };
    case "chat":
    case "conversation":
      return {
        messages: [
          { from: "them", name: "Mereka", text: "Hai...", time: "00:00" },
        ],
      };
    case "news":
    case "police":
    case "cctv":
    case "investigation":
      return {
        caseNumber: "CASE-001",
        classification: "INTERNAL",
        location: "Lokasi",
        datetime: new Date().toLocaleString("id-ID"),
        observedBy: "Nama",
        readings: [{ label: "Status", value: "Normal", status: "normal" }],
        paragraphs: ["Detail laporan..."],
      };
    case "diary":
      return {
        observedBy: "Namamu",
        datetime: new Date().toLocaleDateString("id-ID"),
        paragraphs: ["Catatan hari ini..."],
      };
    default:
      return {};
  }
};

export function StoryEditor({
  template,
  categories,
  onBack,
  initialStory,
}: StoryEditorProps) {
  // Generate initial blocks: from existing draft when editing, else from template structure
  const init = initialStory ?? null;
  const [blocks, setBlocks] = useState<Block[]>(() =>
    init
      ? init.blocks.map(
          (b): Block => ({
            id: genId(),
            type: b.type as BlockType,
            data:
              typeof b.data === "string"
                ? (JSON.parse(b.data as string) as StoryBlockData)
                : (b.data as StoryBlockData),
          }),
        )
      : template.structure.map((s) => ({
          id: genId(),
          type: s.type,
          data: defaultDataFor(s.type),
        })),
  );
  const [title, setTitle] = useState(init?.title ?? "");
  const [excerpt, setExcerpt] = useState(init?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(
    init?.categoryId ?? categories[0]?.id ?? "",
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(init?.thumbnailUrl ?? "");
  const [tags, setTags] = useState<string[]>(
    init?.tags?.map((t) => t.name) ?? [],
  );
  const [tagInput, setTagInput] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(init?.id ?? null);
  const qc = useQueryClient();
  const [showLeftMobile, setShowLeftMobile] = useState(false);
  const [showRightMobile, setShowRightMobile] = useState(false);

  useEffect(() => {
    if (categories.length && !categoryId) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // ===== Block operations =====
  const addBlock = (type: BlockType) => {
    const b: Block = { id: genId(), type, data: defaultDataFor(type) };
    setBlocks((arr) => [...arr, b]);
    setSelectedBlockId(b.id);
    toast.success(`Blok ${type} ditambah 🎨`);
  };
  const deleteBlock = (id: string) => {
    setBlocks((arr) => arr.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };
  const duplicateBlock = (id: string) => {
    setBlocks((arr) => {
      const idx = arr.findIndex((b) => b.id === id);
      if (idx === -1) return arr;
      const copy: Block = {
        ...arr[idx],
        id: genId(),
        data: JSON.parse(JSON.stringify(arr[idx].data)),
      };
      const next = [...arr];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    toast.success("Blok diduplikat ✨");
  };
  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((arr) => {
      const idx = arr.findIndex((b) => b.id === id);
      if (idx === -1) return arr;
      const next = [...arr];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return arr;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };
  const updateBlockData = (id: string, data: Partial<StoryBlockData>) => {
    setBlocks((arr) =>
      arr.map((b) =>
        b.id === id ? { ...b, data: { ...b.data, ...data } } : b,
      ),
    );
  };

  // ===== Tag operations =====
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t) return;
    if (tags.includes(t)) {
      toast.error("Tag udah ada");
      return;
    }
    setTags((arr) => [...arr, t]);
    setTagInput("");
  };

  // ===== Image upload =====
  const uploadImage = async (file: File): Promise<string | null> => {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = async () => {
        try {
          const d = await uploadApi.acceptDataUrl(reader.result as string);
          resolve(d.url);
        } catch (e) {
          if (e instanceof ApiError) toast.error("Upload gagal 😢");
          else toast.error("Upload error");
          resolve(null);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ===== Save / Publish =====
  const buildPayload = (status: "DRAFT" | "PUBLISHED") => ({
    ...(storyId && { id: storyId }),
    title: title.trim() || "Cerita Tanpa Judul",
    excerpt:
      excerpt.trim() ||
      truncate(
        blocks
          .filter((b) => b.type === "text")
          .map((b) => b.data.text ?? "")
          .join(" "),
        200,
      ) ||
      null,
    categoryId,
    templateId: undefined,
    templateSlug: template.slug,
    thumbnailUrl: thumbnailUrl || null,
    tags,
    status,
    blocks: blocks.map((b, i) => ({
      type: b.type,
      data: b.data,
      order: i,
    })),
  });

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      toast.error("Judul wajib diisi dulu 🙏");
      return;
    }
    if (blocks.length === 0) {
      toast.error("Minimal 1 blok cerita");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(publish ? "PUBLISHED" : "DRAFT");
      const d = storyId
        ? await storiesApi.update(payload)
        : await storiesApi.create(payload);
      setStoryId(d.story.id);
      // Draft tabs and list pages read staleTime-2-min caches; saving must
      // break them immediately so published drafts show up on the spot.
      qc.invalidateQueries({ queryKey: queryKeys.stories.all });
      qc.invalidateQueries({ queryKey: queryKeys.home.all });
      if (publish) {
        toast.success("Ceritamu berhasil tayang! ");
        setTimeout(
          () => (window.location.href = `/cerita/${d.story.slug}`),
          1500,
        );
      } else {
        toast.success("Draft berhasil disimpan ✨");
      }
    } catch (e) {
      if (e instanceof ApiError) {
        toast.error((e.data as { error?: string } | undefined)?.error ?? "Gagal simpan");
      } else {
        toast.error("Error simpan");
      }
    } finally {
      setSaving(false);
    }
  };

  // ===== Top bar =====
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top toolbar */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
        <div className="px-4 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Ganti Template</span>
          </Button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Badge
              variant="outline"
              className="border-primary/40 text-primary hidden sm:inline-flex"
            >
              {template.emoji} {template.name}
            </Badge>
            <Input
              placeholder="Judul ceritamu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-semibold text-sm sm:text-base"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(true)}
            className="gap-1.5"
          >
            <Eye className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">
              {saving ? "Nggak.." : "Draft"}
            </span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="gap-1.5 bg-primary"
          >
            <Send className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Publikasi</span>
          </Button>
        </div>
      </header>

      {/* 3-panel editor */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] min-h-0">
        {/* LEFT SIDEBAR — Block list + add */}
        <aside className="hidden lg:flex flex-col border-r border-border/40 bg-card/20">
          <LeftPanel
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelect={setSelectedBlockId}
            onAdd={addBlock}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
            onMove={moveBlock}
            blockTypes={BLOCK_TYPES}
          />
        </aside>

        {/* Mobile left toggle */}
        <button
          className="lg:hidden fixed bottom-4 left-4 z-30 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center"
          onClick={() => setShowLeftMobile(true)}
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* CENTER — Live preview */}
        <main className="overflow-y-auto bg-background/40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            {/* Thumbnail + meta */}
            <div className="mb-6 space-y-4">
              <div>
                <Label className="text-xs">Thumbnail Cerita</Label>
                <ImageInput
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  onUpload={uploadImage}
                  aspect="aspect-video"
                />
              </div>
              <div>
                <Label className="text-xs">
                  Excerpt (1 kalimat serem buat preview)
                </Label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Contoh: Malam itu, gue lewat jembatan. Bau kemeko mulai tercium..."
                  className="resize-none min-h-[60px]"
                  maxLength={280}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Kategori</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="bg-background/60">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Tags (pisahkan enter)</Label>
                  <div className="flex gap-1">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="seram, urban-legend..."
                      className="bg-background/60"
                    />
                    <Button size="icon" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1 pr-1">
                      #{t}
                      <button
                        onClick={() =>
                          setTags((arr) => arr.filter((x) => x !== t))
                        }
                        className="hover:text-primary"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Title preview */}
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">
              {title || "Judul Ceritamu Muncul di Sini 👻"}
            </h1>

            {/* Blocks */}
            <div className="space-y-4">
              {blocks.length === 0 && (
                <div className="p-8 rounded-2xl glass text-center text-sm text-muted-foreground">
                  Belum ada blok. Tambah blok dari panel kiri yuk →
                </div>
              )}
              {blocks.map((b, i) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBlockId(b.id)}
                  className={cn(
                    "group relative rounded-2xl transition-all cursor-pointer",
                    selectedBlockId === b.id
                      ? "ring-2 ring-primary/60 bg-primary/5"
                      : "hover:ring-1 hover:ring-border/60",
                  )}
                >
                  {/* Block number badge */}
                  <div className="absolute -left-2 -top-2 z-10 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {i + 1}
                  </div>
                  {/* Quick actions */}
                  {selectedBlockId === b.id && (
                    <div className="absolute -top-3 right-2 z-20 flex gap-0.5 glass-strong rounded-full p-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(b.id, -1);
                        }}
                        className="w-7 h-7 rounded-full hover:bg-primary/20 flex items-center justify-center"
                        title="Naik"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(b.id, 1);
                        }}
                        className="w-7 h-7 rounded-full hover:bg-primary/20 flex items-center justify-center"
                        title="Turun"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateBlock(b.id);
                        }}
                        className="w-7 h-7 rounded-full hover:bg-primary/20 flex items-center justify-center"
                        title="Duplikat"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(b.id);
                        }}
                        className="w-7 h-7 rounded-full hover:bg-destructive/20 hover:text-destructive flex items-center justify-center"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="p-4">
                    <StoryBlockRenderer type={b.type} data={b.data} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl border-2 border-dashed border-border/40 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeftMobile(true)}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Blok Baru
              </Button>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR — Properties */}
        <aside className="hidden lg:flex flex-col border-l border-border/40 bg-card/20">
          <RightPanel
            block={selectedBlock}
            onUpdate={(data) =>
              selectedBlockId && updateBlockData(selectedBlockId, data)
            }
            onUpload={uploadImage}
          />
        </aside>

        {/* Mobile right toggle */}
        {selectedBlock && (
          <button
            className="lg:hidden fixed bottom-4 right-4 z-30 w-12 h-12 rounded-full glass-strong shadow-xl flex items-center justify-center"
            onClick={() => setShowRightMobile(true)}
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </button>
        )}
      </div>

      {/* Mobile drawer — Add block */}
      {showLeftMobile && (
        <MobileDrawer
          title="Blok & Tambah"
          onClose={() => setShowLeftMobile(false)}
        >
          <LeftPanel
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelect={(id) => {
              setSelectedBlockId(id);
              setShowLeftMobile(false);
            }}
            onAdd={(t) => {
              addBlock(t);
            }}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
            onMove={moveBlock}
            blockTypes={BLOCK_TYPES}
          />
        </MobileDrawer>
      )}

      {/* Mobile drawer — Properties */}
      {showRightMobile && selectedBlock && (
        <MobileDrawer
          title="Properti Blok"
          onClose={() => setShowRightMobile(false)}
        >
          <RightPanel
            block={selectedBlock}
            onUpdate={(data) =>
              selectedBlockId && updateBlockData(selectedBlockId!, data)
            }
            onUpload={uploadImage}
          />
        </MobileDrawer>
      )}

      {/* Preview modal */}
      {showPreview && (
        <PreviewModal
          title={title}
          excerpt={excerpt}
          thumbnailUrl={thumbnailUrl}
          blocks={blocks}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// =================================================================
// LEFT PANEL — Block list + add block grid
// =================================================================

function LeftPanel({
  blocks,
  selectedBlockId,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onMove,
  blockTypes,
}: {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
  onAdd: (t: BlockType) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  blockTypes: { type: BlockType; label: string; icon: any; desc: string }[];
}) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-5 fixed">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Tambah Blok
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {blockTypes.map((bt) => {
              const Icon = bt.icon;
              return (
                <button
                  key={bt.type}
                  onClick={() => onAdd(bt.type)}
                  title={bt.desc}
                  className="group flex flex-col items-center gap-1 p-2.5 rounded-xl glass hover:glass-strong hover:bg-primary/10 transition-all"
                >
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {bt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Blok Cerita ({blocks.length})
          </h3>
          <div className="space-y-1.5">
            {blocks.map((b, i) => {
              const meta = blockTypes.find((bt) => bt.type === b.type);
              const Icon = meta?.icon ?? Type;
              return (
                <div
                  key={b.id}
                  onClick={() => onSelect(b.id)}
                  className={cn(
                    "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                    selectedBlockId === b.id
                      ? "bg-primary/15 ring-1 ring-primary/40"
                      : "glass hover:glass-strong",
                  )}
                >
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium truncate flex-1">
                    {meta?.label ?? b.type} #{i + 1}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(b.id, -1);
                      }}
                      className="w-5 h-5 rounded hover:bg-primary/30 flex items-center justify-center"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(b.id, 1);
                      }}
                      className="w-5 h-5 rounded hover:bg-primary/30 flex items-center justify-center"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(b.id);
                      }}
                      className="w-5 h-5 rounded hover:bg-primary/30 flex items-center justify-center"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(b.id);
                      }}
                      className="w-5 h-5 rounded hover:bg-destructive/30 hover:text-destructive flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
            {blocks.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Belum ada blok. Tambahkan dari atas ⬆️
              </p>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

// =================================================================
// RIGHT PANEL — Block properties editor
// =================================================================

function RightPanel({
  block,
  onUpdate,
  onUpload,
}: {
  block: Block | undefined;
  onUpdate: (data: Partial<StoryBlockData>) => void;
  onUpload: (file: File) => Promise<string | null>;
}) {
  if (!block) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-6 text-center fixed">
          <div className="w-12 h-12 rounded-full glass mx-auto mb-3 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Pilih blok di kiri atau klik blok di tengah buat edit propertinya.
          </p>
        </div>
      </ScrollArea>
    );
  }

  const d = block.data;

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4 fixed">
        <div>
          <Badge variant="outline" className="border-primary/40 text-primary">
            Edit: {block.type}
          </Badge>
        </div>

        {/* TEXT */}
        {block.type === "text" && (
          <>
            <Field label="Teks">
              <Textarea
                value={d.text ?? ""}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Tulis sesuatu..."
                className="resize-none min-h-[120px] bg-background/60"
              />
            </Field>
            <Field label="Align">
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((a) => (
                  <Button
                    key={a}
                    size="sm"
                    variant={d.align === a ? "default" : "outline"}
                    onClick={() => onUpdate({ align: a })}
                    className="flex-1"
                  >
                    {a === "left" ? (
                      <AlignLeft className="w-4 h-4" />
                    ) : a === "center" ? (
                      <AlignCenter className="w-4 h-4" />
                    ) : (
                      <AlignRight className="w-4 h-4" />
                    )}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Ukuran Font">
              <div className="flex gap-1">
                {(["sm", "md", "lg", "xl"] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={d.fontSize === s ? "default" : "outline"}
                    onClick={() => onUpdate({ fontSize: s })}
                    className="flex-1 text-xs"
                  >
                    {s === "sm"
                      ? "Kecil"
                      : s === "md"
                        ? "Sedang"
                        : s === "lg"
                          ? "Besar"
                          : "XL"}
                  </Button>
                ))}
              </div>
            </Field>
          </>
        )}

        {/* IMAGE */}
        {["image", "large-image", "cover-image"].includes(block.type) && (
          <>
            <Field label="Gambar">
              <ImageInput
                value={d.imageUrl ?? ""}
                onChange={(v) => onUpdate({ imageUrl: v })}
                onUpload={onUpload}
                aspect="aspect-video"
              />
            </Field>
            <Field label="Caption (opsional)">
              <Input
                value={d.caption ?? ""}
                onChange={(e) => onUpdate({ caption: e.target.value })}
                placeholder="Penjelasan gambar..."
                className="bg-background/60"
              />
            </Field>
          </>
        )}

        {/* QUOTE */}
        {block.type === "quote" && (
          <>
            <Field label="Kutipan">
              <Textarea
                value={d.text ?? ""}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="resize-none min-h-[80px] bg-background/60"
              />
            </Field>
            <Field label="Pengarang">
              <Input
                value={d.author ?? ""}
                onChange={(e) => onUpdate({ author: e.target.value })}
                placeholder="Sumber..."
                className="bg-background/60"
              />
            </Field>
          </>
        )}

        {/* GALLERY */}
        {block.type === "gallery" && (
          <Field label={`Galeri (${d.images?.length ?? 0} foto)`}>
            <div className="space-y-2">
              {(d.images ?? []).map((img, i) => (
                <div key={i} className="space-y-1.5 p-2 rounded-lg glass">
                  <ImageInput
                    value={img.url}
                    onChange={(v) => {
                      const next = [...(d.images ?? [])];
                      next[i] = { ...next[i], url: v };
                      onUpdate({ images: next });
                    }}
                    onUpload={async (f) => {
                      const url = await onUpload(f);
                      if (url) {
                        const next = [...(d.images ?? [])];
                        next[i] = { ...next[i], url };
                        onUpdate({ images: next });
                      }
                    }}
                    aspect="aspect-square"
                  />
                  <Input
                    value={img.caption ?? ""}
                    onChange={(e) => {
                      const next = [...(d.images ?? [])];
                      next[i] = { ...next[i], caption: e.target.value };
                      onUpdate({ images: next });
                    }}
                    placeholder="Caption..."
                    className="bg-background/60 text-xs"
                  />
                  <button
                    onClick={() =>
                      onUpdate({
                        images: (d.images ?? []).filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-xs text-destructive hover:underline"
                  >
                    Hapus foto ini
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onUpdate({
                    images: [...(d.images ?? []), { url: "", caption: "" }],
                  })
                }
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" /> Tambah Foto
              </Button>
            </div>
          </Field>
        )}

        {/* TIMELINE */}
        {block.type === "timeline" && (
          <Field label={`Timeline (${d.timeline?.length ?? 0} titik)`}>
            <div className="space-y-2">
              {(d.timeline ?? []).map((t, i) => (
                <div key={i} className="space-y-1.5 p-2 rounded-lg glass">
                  <Input
                    value={t.time}
                    onChange={(e) => {
                      const next = [...(d.timeline ?? [])];
                      next[i] = { ...next[i], time: e.target.value };
                      onUpdate({ timeline: next });
                    }}
                    placeholder="Waktu..."
                    className="bg-background/60 text-xs"
                  />
                  <Input
                    value={t.title}
                    onChange={(e) => {
                      const next = [...(d.timeline ?? [])];
                      next[i] = { ...next[i], title: e.target.value };
                      onUpdate({ timeline: next });
                    }}
                    placeholder="Judul..."
                    className="bg-background/60 text-xs"
                  />
                  <Textarea
                    value={t.description}
                    onChange={(e) => {
                      const next = [...(d.timeline ?? [])];
                      next[i] = { ...next[i], description: e.target.value };
                      onUpdate({ timeline: next });
                    }}
                    placeholder="Deskripsi..."
                    className="bg-background/60 text-xs resize-none min-h-[50px]"
                  />
                  <button
                    onClick={() =>
                      onUpdate({
                        timeline: (d.timeline ?? []).filter(
                          (_, idx) => idx !== i,
                        ),
                      })
                    }
                    className="text-xs text-destructive hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onUpdate({
                    timeline: [
                      ...(d.timeline ?? []),
                      { time: "00:00", title: "", description: "" },
                    ],
                  })
                }
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" /> Tambah Titik
              </Button>
            </div>
          </Field>
        )}

        {/* CHAT / CONVERSATION */}
        {(block.type === "chat" || block.type === "conversation") && (
          <Field label={`Pesan (${d.messages?.length ?? 0})`}>
            <div className="space-y-2">
              {(d.messages ?? []).map((m, i) => (
                <div key={i} className="space-y-1.5 p-2 rounded-lg glass">
                  <div className="flex gap-1">
                    {(["me", "them"] as const).map((f) => (
                      <Button
                        key={f}
                        size="sm"
                        variant={m.from === f ? "default" : "outline"}
                        onClick={() => {
                          const next = [...(d.messages ?? [])];
                          next[i] = { ...next[i], from: f };
                          onUpdate({ messages: next });
                        }}
                        className="flex-1 text-xs"
                      >
                        {f === "me" ? "Gue" : "Mereka"}
                      </Button>
                    ))}
                  </div>
                  {m.from === "them" && (
                    <Input
                      value={m.name ?? ""}
                      onChange={(e) => {
                        const next = [...(d.messages ?? [])];
                        next[i] = { ...next[i], name: e.target.value };
                        onUpdate({ messages: next });
                      }}
                      placeholder="Nama pengirim..."
                      className="bg-background/60 text-xs"
                    />
                  )}
                  <Textarea
                    value={m.text}
                    onChange={(e) => {
                      const next = [...(d.messages ?? [])];
                      next[i] = { ...next[i], text: e.target.value };
                      onUpdate({ messages: next });
                    }}
                    placeholder="Pesan..."
                    className="bg-background/60 text-xs resize-none min-h-[50px]"
                  />
                  <Input
                    value={m.time ?? ""}
                    onChange={(e) => {
                      const next = [...(d.messages ?? [])];
                      next[i] = { ...next[i], time: e.target.value };
                      onUpdate({ messages: next });
                    }}
                    placeholder="23:45"
                    className="bg-background/60 text-xs"
                  />
                  <button
                    onClick={() =>
                      onUpdate({
                        messages: (d.messages ?? []).filter(
                          (_, idx) => idx !== i,
                        ),
                      })
                    }
                    className="text-xs text-destructive hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onUpdate({
                    messages: [
                      ...(d.messages ?? []),
                      { from: "them", name: "Mereka", text: "", time: "" },
                    ],
                  })
                }
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" /> Tambah Pesan
              </Button>
            </div>
          </Field>
        )}

        {/* REPORT (news / police / cctv / investigation) */}
        {["news", "police", "cctv", "investigation"].includes(block.type) && (
          <>
            <Field label="Case Number">
              <Input
                value={d.caseNumber ?? ""}
                onChange={(e) => onUpdate({ caseNumber: e.target.value })}
                className="bg-background/60 font-mono text-xs"
              />
            </Field>
            <Field label="Classification">
              <Input
                value={d.classification ?? ""}
                onChange={(e) => onUpdate({ classification: e.target.value })}
                className="bg-background/60 text-xs"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Lokasi">
                <Input
                  value={d.location ?? ""}
                  onChange={(e) => onUpdate({ location: e.target.value })}
                  className="bg-background/60 text-xs"
                />
              </Field>
              <Field label="Waktu">
                <Input
                  value={d.datetime ?? ""}
                  onChange={(e) => onUpdate({ datetime: e.target.value })}
                  className="bg-background/60 text-xs"
                />
              </Field>
            </div>
            <Field label="Pelapor">
              <Input
                value={d.observedBy ?? ""}
                onChange={(e) => onUpdate({ observedBy: e.target.value })}
                className="bg-background/60 text-xs"
              />
            </Field>
            <Field label={`Readings (${d.readings?.length ?? 0})`}>
              <div className="space-y-1.5">
                {(d.readings ?? []).map((r, i) => (
                  <div key={i} className="flex gap-1">
                    <Input
                      value={r.label}
                      onChange={(e) => {
                        const next = [...(d.readings ?? [])];
                        next[i] = { ...next[i], label: e.target.value };
                        onUpdate({ readings: next });
                      }}
                      placeholder="Label"
                      className="bg-background/60 text-xs"
                    />
                    <Input
                      value={r.value}
                      onChange={(e) => {
                        const next = [...(d.readings ?? [])];
                        next[i] = { ...next[i], value: e.target.value };
                        onUpdate({ readings: next });
                      }}
                      placeholder="Value"
                      className="bg-background/60 text-xs"
                    />
                    <Select
                      value={r.status ?? "normal"}
                      onValueChange={(v) => {
                        const next = [...(d.readings ?? [])];
                        next[i] = { ...next[i], status: v as any };
                        onUpdate({ readings: next });
                      }}
                    >
                      <SelectTrigger className="bg-background/60 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() =>
                        onUpdate({
                          readings: (d.readings ?? []).filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="text-destructive hover:text-destructive/80 px-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onUpdate({
                      readings: [
                        ...(d.readings ?? []),
                        { label: "", value: "", status: "normal" },
                      ],
                    })
                  }
                  className="w-full text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> Tambah Reading
                </Button>
              </div>
            </Field>
            <Field label={`Detail Paragraf (${d.paragraphs?.length ?? 0})`}>
              <div className="space-y-1.5">
                {(d.paragraphs ?? []).map((p, i) => (
                  <div key={i} className="flex gap-1">
                    <Textarea
                      value={p}
                      onChange={(e) => {
                        const next = [...(d.paragraphs ?? [])];
                        next[i] = e.target.value;
                        onUpdate({ paragraphs: next });
                      }}
                      placeholder={`Paragraf ${i + 1}`}
                      className="bg-background/60 text-xs resize-none min-h-[50px]"
                    />
                    <button
                      onClick={() =>
                        onUpdate({
                          paragraphs: (d.paragraphs ?? []).filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="text-destructive hover:text-destructive/80 px-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onUpdate({ paragraphs: [...(d.paragraphs ?? []), ""] })
                  }
                  className="w-full text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> Tambah Paragraf
                </Button>
              </div>
            </Field>
          </>
        )}

        {/* DIARY */}
        {block.type === "diary" && (
          <>
            <Field label="Penulis">
              <Input
                value={d.observedBy ?? ""}
                onChange={(e) => onUpdate({ observedBy: e.target.value })}
                className="bg-background/60 text-xs"
              />
            </Field>
            <Field label="Tanggal">
              <Input
                value={d.datetime ?? ""}
                onChange={(e) => onUpdate({ datetime: e.target.value })}
                className="bg-background/60 text-xs"
              />
            </Field>
            <Field label={`Catatan (${d.paragraphs?.length ?? 0})`}>
              <div className="space-y-1.5">
                {(d.paragraphs ?? []).map((p, i) => (
                  <div key={i} className="flex gap-1">
                    <Textarea
                      value={p}
                      onChange={(e) => {
                        const next = [...(d.paragraphs ?? [])];
                        next[i] = e.target.value;
                        onUpdate({ paragraphs: next });
                      }}
                      placeholder={`Catatan ${i + 1}`}
                      className="bg-background/60 text-xs resize-none min-h-[60px]"
                    />
                    <button
                      onClick={() =>
                        onUpdate({
                          paragraphs: (d.paragraphs ?? []).filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="text-destructive hover:text-destructive/80 px-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onUpdate({ paragraphs: [...(d.paragraphs ?? []), ""] })
                  }
                  className="w-full text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> Tambah Catatan
                </Button>
              </div>
            </Field>
          </>
        )}
      </div>
    </ScrollArea>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ImageInput({
  value,
  onChange,
  onUpload,
  aspect = "aspect-video",
}: {
  value: string;
  onChange: (v: string) => void;
  onUpload: (file: File) => Promise<string | null>;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const url = await onUpload(file);
    if (url) onChange(url);
    setUploading(false);
  };

  return (
    <div className="space-y-1.5">
      {value ? (
        <div
          className={cn(
            "relative rounded-xl overflow-hidden bg-muted group",
            aspect,
          )}
        >
          {}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1.5 p-4",
            aspect,
          )}
        >
          <ImagePlus className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {uploading ? "Lagi upload..." : "Tambah Foto 📷"}
          </span>
        </button>
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="atau paste URL gambar..."
        className="bg-background/60 text-xs"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function MobileDrawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative ml-auto w-[85%] max-w-sm bg-card border-l border-border/50 flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-3 border-b border-border/40">
          <h3 className="font-semibold text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function PreviewModal({
  title,
  excerpt,
  thumbnailUrl,
  blocks,
  onClose,
}: {
  title: string;
  excerpt: string;
  thumbnailUrl: string;
  blocks: Block[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-background rounded-3xl border border-border/50 my-8 animate-scale-in">
        <div className="sticky top-0 flex items-center justify-between p-4 bg-background/80 backdrop-blur border-b border-border/40 rounded-t-3xl z-10">
          <Badge variant="outline" className="border-primary/40 text-primary">
            <Eye className="w-3 h-3 mr-1" /> Preview Mode
          </Badge>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-extrabold mb-4">
            {title || "Judul Cerita"}
          </h1>
          {excerpt && <p className="text-muted-foreground mb-5">{excerpt}</p>}
          {thumbnailUrl && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-6">
              {}
              <img
                src={thumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="space-y-6">
            {blocks.map((b) => (
              <StoryBlockRenderer key={b.id} type={b.type} data={b.data} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
