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
    description: "Sisipkan quote dramatic di tengah cerita biar makin bikin merinding.",
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
    description: "Cover kuat + galeri gambar. Cocok buat dokumentasi tempangker.",
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
    description: "Fokus ke kata-kata. Buat kalian yang bisa bikin bulu kuduk ngeri cuma lewat teks.",
    emoji: "✍️",
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
    description: "Gambar kiri, teks kanan. Vibes kayak magazine premium.",
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
    description: "Style obrolan dua arah. Vibes cerita lewat dialog.",
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
    description: "Cerita lewat screenshot chat WA. Paling serem karna kerasa nyata.",
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
    description: "Gaya laporan investigasi. Casenya kayak file rahasia.",
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
    description: "Gaya buku harian. Personal banget, berasa baca rahasia seseorang.",
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
    description: "Gaya berita media. Serasa baca artikel daring kayanya kejadian beneran.",
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
    description: "Gaya file kasus polisi. Redacted, misterius, kerasa classified banget.",
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
    description: "Gaya laporan CCTV. Timestamp, footage, kerasa kayak evidence file.",
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
    description: "Gaya laporan tim paranormal. EMF reading, suhu, observation notes.",
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
