// All app-wide constants in Bahasa Indonesia

export const CATEGORIES = [
  { slug: "urban-legend", name: "Urban Legend", emoji: "🏙️", color: "#ef4444" },
  { slug: "pengalaman-pribadi", name: "Pengalaman Pribadi", emoji: "👁️", color: "#f97316" },
  { slug: "rumah-angker", name: "Rumah Angker", emoji: "🏚️", color: "#dc2626" },
  { slug: "pendakian", name: "Pendakian", emoji: "⛰️", color: "#84cc16" },
  { slug: "sekolah", name: "Sekolah", emoji: "🏫", color: "#06b6d4" },
  { slug: "rumah-sakit", name: "Rumah Sakit", emoji: "🏥", color: "#3b82f6" },
  { slug: "misteri", name: "Misteri", emoji: "🔮", color: "#a855f7" },
  { slug: "ritual", name: "Ritual", emoji: "🕯️", color: "#ec4899" },
  { slug: "makhluk-gaib", name: "Makhluk Gaib", emoji: "👻", color: "#6366f1" },
  { slug: "lainnya", name: "Lainnya", emoji: "✨", color: "#64748b" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

// =================================================================
// STORY TEMPLATES — Horrorin's MVP value proposition
// Each template has a `structure`: ordered list of block types.
// When user picks a template, we generate editable blocks from it.
// =================================================================

export type BlockType =
  | "image"
  | "text"
  | "quote"
  | "gallery"
  | "timeline"
  | "chat"
  | "news"
  | "cctv"
  | "police"
  | "investigation"
  | "diary"
  | "conversation"
  | "large-image"
  | "cover-image";

export interface TemplateStructure {
  type: BlockType;
}

export interface TemplateDef {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  accent: string;
  structure: TemplateStructure[];
  preview: string; // mini ascii preview
}

export const TEMPLATES: TemplateDef[] = [
  {
    slug: "klasik",
    name: "Klasik",
    description: "Teks & gambar bergantian. Cocok buat cerita pendek yang padat.",
    emoji: "📚",
    accent: "#ef4444",
    structure: [
      { type: "image" },
      { type: "text" },
      { type: "image" },
      { type: "text" },
    ],
    preview: "🖼️\n📝\n🖼️\n📝",
  },
  {
    slug: "visual-mendalam",
    name: "Visual Mendalam",
    description: "Buka dengan gambar besar, lalu cerita mengalir.",
    emoji: "🎬",
    accent: "#f97316",
    structure: [
      { type: "large-image" },
      { type: "text" },
      { type: "image" },
      { type: "text" },
    ],
    preview: "🌌\n📝\n🖼️\n📝",
  },
  {
    slug: "kutipan-berkesan",
    name: "Kutipan Berkesan",
    description: "Sisipkan kutipan di antara bagian cerita.",
    emoji: "💀",
    accent: "#dc2626",
    structure: [
      { type: "image" },
      { type: "text" },
      { type: "quote" },
      { type: "image" },
      { type: "text" },
    ],
    preview: "🖼️\n📝\n❝\n🖼️\n📝",
  },
  {
    slug: "galeri-foto",
    name: "Galeri Foto",
    description: "Awali cerita dengan gambar sampul dan lanjutkan dengan galeri.",
    emoji: "📷",
    accent: "#06b6d4",
    structure: [
      { type: "cover-image" },
      { type: "text" },
      { type: "gallery" },
      { type: "text" },
    ],
    preview: "🌄\n📝\n🗂️\n📝",
  },
  {
    slug: "tulisan-saja",
    name: "Tulisan Saja",
    description: "Fokus pada tulisan untuk menyampaikan cerita melalui kata-kata.",
    emoji: "",
    accent: "#a855f7",
    structure: [
      { type: "text" },
      { type: "text" },
      { type: "text" },
    ],
    preview: "📝\n📝\n📝",
  },
  {
    slug: "split-layout",
    name: "Split Layout",
    description: "Tampilkan gambar di kiri dan teks di kanan.",
    emoji: "📰",
    accent: "#ec4899",
    structure: [
      { type: "image" },
      { type: "text" },
      { type: "image" },
      { type: "text" },
    ],
    preview: "🖼️ | 📝\n🖼️ | 📝",
  },
  {
    slug: "timeline",
    name: "Timeline",
    description: "Cerita berurutan dengan timeline. Cocok buat pengalaman bertahap.",
    emoji: "⏳",
    accent: "#84cc16",
    structure: [
      { type: "text" },
      { type: "timeline" },
      { type: "text" },
    ],
    preview: "📝\n⏳\n📝",
  },
  {
    slug: "conversation",
    name: "Conversation",
    description: "Sampaikan cerita melalui dialog dua arah.",
    emoji: "💬",
    accent: "#3b82f6",
    structure: [
      { type: "text" },
      { type: "conversation" },
      { type: "text" },
    ],
    preview: "📝\n💬\n📝",
  },
  {
    slug: "chat-whatsapp",
    name: "Chat WhatsApp",
    description: "Sampaikan cerita melalui percakapan bergaya chat WhatsApp.",
    emoji: "📱",
    accent: "#22c55e",
    structure: [
      { type: "text" },
      { type: "chat" },
      { type: "text" },
    ],
    preview: "📝\n📱\n📝",
  },
  {
    slug: "investigation",
    name: "Investigation Report",
    description: "Sajikan cerita dalam format laporan investigasi.",
    emoji: "🔍",
    accent: "#6366f1",
    structure: [
      { type: "text" },
      { type: "investigation" },
      { type: "image" },
      { type: "text" },
    ],
    preview: "📝\n🔍\n🖼️\n📝",
  },
  {
    slug: "diary",
    name: "Diary",
    description: "Susun cerita dalam format buku harian.",
    emoji: "📔",
    accent: "#f59e0b",
    structure: [
      { type: "text" },
      { type: "diary" },
      { type: "text" },
    ],
    preview: "📝\n📔\n📝",
  },
  {
    slug: "news-report",
    name: "News Report",
    description: "Sajikan cerita dalam format artikel berita.",
    emoji: "📺",
    accent: "#0ea5e9",
    structure: [
      { type: "text" },
      { type: "news" },
      { type: "image" },
      { type: "text" },
    ],
    preview: "📝\n📺\n🖼️\n📝",
  },
  {
    slug: "police-case",
    name: "Police Case File",
    description: "Susun cerita dalam format berkas kasus kepolisian.",
    emoji: "🚔",
    accent: "#1e40af",
    structure: [
      { type: "text" },
      { type: "police" },
      { type: "image" },
      { type: "text" },
    ],
    preview: "📝\n🚔\n🖼️\n📝",
  },
  {
    slug: "cctv-report",
    name: "CCTV Report",
    description: "Susun cerita dengan catatan waktu dan rekaman kamera pengawas.",
    emoji: "📹",
    accent: "#7c3aed",
    structure: [
      { type: "text" },
      { type: "cctv" },
      { type: "image" },
      { type: "text" },
    ],
    preview: "📝\n📹\n🖼️\n📝",
  },
  {
    slug: "paranormal",
    name: "Paranormal Investigation",
    description: "Sajikan cerita dalam format laporan investigasi paranormal.",
    emoji: "🕯️",
    accent: "#be123c",
    structure: [
      { type: "text" },
      { type: "investigation" },
      { type: "image" },
      { type: "quote" },
    ],
    preview: "📝\n🕯️\n🖼️\n❝",
  },
];

// Helper to look up template by slug
export const getTemplate = (slug: string) =>
  TEMPLATES.find((t) => t.slug === slug);

export const getCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

// Reading time estimate from text length (Indonesian ~ 200 wpm)
export const estimateReadingTime = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};
