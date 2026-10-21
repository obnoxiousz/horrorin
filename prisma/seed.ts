// Horrorin — database seed script
// Run: bun run scripts/seed.ts

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { CATEGORIES, TEMPLATES } from "../src/constants";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Horrorin...");

  // ===== Categories =====
  console.log("  → Categories");
  for (const c of CATEGORIES) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.emoji, color: c.color },
      create: { slug: c.slug, name: c.name, icon: c.emoji, color: c.color },
    });
  }

  // ===== Templates =====
  console.log("  → Templates");
  for (const t of TEMPLATES) {
    await db.storyTemplate.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description,
        icon: t.emoji,
        structure: JSON.stringify(t.structure),
      },
      create: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        icon: t.emoji,
        structure: JSON.stringify(t.structure),
        isActive: true,
      },
    });
  }

  // ===== Admin =====
  console.log("  → Admin user");
  const adminPass = await hash("admin123", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@horrorin.id" },
    update: {},
    create: {
      email: "admin@horrorin.id",
      password: adminPass,
      name: "Admin Horrorin",
      username: "admin",
      role: "ADMIN",
      bio: "Penjaga gerbang dunia horror 👻",
      profile: { create: { bio: "Penjaga gerbang dunia horror 👻" } },
    },
  });

  // ===== Sample users =====
  console.log("  → Sample users");
  const userPass = await hash("password123", 12);
  const users = [
    { name: "Rangga Setiawan", username: "rangga_gaib", email: "rangga@horrorin.id", bio: "Pencinta urban legend Jakarta. Kumpul cerita serem tiap malam Jumat. 🌙" },
    { name: "Maya Pradnya", username: "maya_misteri", email: "maya@horrorin.id", bio: "Investigator paranormal paruh waktu. Buku harian penuh dengan pengalaman gaib." },
    { name: "Bayu Atmaja", username: "bayu_pendaki", email: "bayu@horrorin.id", bio: "Pendaki yang sering banget ketemu 'pasukan' di gunung. ⛰️" },
    { name: "Sinta Larasati", username: "sinta_diary", email: "sinta@horrorin.id", bio: "Tukang cerita pengalaman pribadi yang bikin bulu kuduk merinding." },
  ];
  const createdUsers = [];
  for (const u of users) {
    const user = await db.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: userPass,
        name: u.name,
        username: u.username,
        bio: u.bio,
        profile: { create: { bio: u.bio } },
      },
    });
    createdUsers.push(user);
  }

  // ===== Sample stories =====
  console.log("  → Sample stories");
  const categories = await db.category.findMany();
  const templates = await db.storyTemplate.findMany();
  const getCat = (slug: string) => categories.find((c) => c.slug === slug)!;
  const getTpl = (slug: string) => templates.find((t) => t.slug === slug)!;

  const sampleStories = [
    {
      title: "Kuntilanak di Jembatan Kalibata",
      excerpt: "Malam itu, gue baru kelar lembur. Lewat jembatan, bau kemeko mulai tercium...",
      authorIdx: 0,
      categorySlug: "urban-legend",
      templateSlug: "klasik",
      thumbnail: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1200",
      tags: ["kuntilanak", "jakarta", "kalibata"],
      blocks: [
        { type: "image", data: { imageUrl: "https://images.unsplash.com/photo-1520637736862-4d197d17c52a?w=1200", caption: "Jembatan Kalibata malam hari" }, order: 0 },
        { type: "text", data: { text: "Malam itu, gue baru kelar lembur. Jam 12 lewat, jalanan Jakarta udah sepi banget. Gue ngebut pulang lewat Kalibata karena itu jalur paling cepet ke kontrakan gue.\n\nPas di jembatan, tiba-tiba bau kemeko. Wangi banget, tapi bikin gue merinding. Gue coba abaikan, gas terus. Tapi kilasan putih di spion motor bikin gue langsung rem." }, order: 1 },
        { type: "image", data: { imageUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934847c?w=1200", caption: "Kabut tipis di jembatan" }, order: 2 },
        { type: "text", data: { text: "Di spion, gue liat perempuan rambut panjang, kulit putih pucat. Dia ketawa — ketawa kuntilanak khas yang bikin bulu kuduk berdiri. Gue gak berani ngadep. Gue pasang gigi 4, mata gue fokus depan, gas sekuat tenaga.\n\nSampai kontrakan, gue langsung sholat dan baca Quran. Tapi suara ketawa itu masih ada di kuping gue sampai subuh. Konon, jembatan Kalibata itu emang tempat favorit kuntilanak nyari tumbal." }, order: 3 },
      ],
    },
    {
      title: "Pengalaman Pendakian Semeru yang Bikin Gue Trauma",
      excerpt: "Pas lewat Watu Reja, gue denger suara pasukan. Tapi gue lagi sendirian...",
      authorIdx: 2,
      categorySlug: "pendakian",
      templateSlug: "timeline",
      thumbnail: "https://images.unsplash.com/photo-1454944338482-a69bb95894af?w=1200",
      tags: ["semeru", "pendakian", "pasukan"],
      blocks: [
        { type: "text", data: { text: "Ini pengalaman pendakian Semeru tahun 2019 yang gak akan gue lupa seumur hidup. Gue mau cerita detail, biar kalian kerasa gimana seramnya." }, order: 0 },
        { type: "timeline", data: { timeline: [
          { time: "Day 1 — 14:00", title: "Mulai dari Ranu Pane", description: "Berangkat dari Ranu Pane bersama 2 teman. Cuaca cerah, trek aman." },
          { time: "Day 1 — 19:00", title: "Sampai Ranu Kumbolo", description: "Malam pertama, bikin tenda di pinggir danau. Suara alam masih normal." },
          { time: "Day 2 — 04:00", title: "Melanjutkan ke Kalimati", description: "Berangkat subuh. Lewat Watu Reja, mulai kerasa aneh." },
          { time: "Day 2 — 05:30", title: "Insiden di Watu Reja", description: "Denger suara langkah ratusan orang di belakang gue. Putar balik, kosong." },
          { time: "Day 2 — 06:00", title: "Satu teman gak keliatan", description: "Si Budi yang jalan terakhir, menghilang. Ketemu 2 jam kemudian di atas, duduk sendiri, menatap kosong." },
        ]}, order: 1 },
        { type: "image", data: { imageUrl: "https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?w=1200", caption: "Pemandangan Semeru pagi hari" }, order: 2 },
        { type: "quote", data: { text: "Jangan pernah nyepi sendirian di Watu Reja. Mereka selalu ngajak.", author: "Pak Supir Angkutan Lokal" }, order: 3 },
        { type: "text", data: { text: "Sampai sekarang, Budi gak mau cerita apa yang dia liat. Kami gak lanjut pendakian, turun hari itu juga. Gue gak akan pernah balik ke Semeru. Bukan karena lelah, tapi karena 'mereka' yang jalan bareng kita." }, order: 4 },
      ],
    },
    {
      title: "Rumah Sebelah Kontrakan Gue: Penghuni Lantai 2",
      excerpt: "Kontrakan sebelah udah kosong 3 tahun. Tapi tiap malem Jumat, lampu lantai 2 nyala...",
      authorIdx: 3,
      categorySlug: "rumah-angker",
      templateSlug: "diary",
      thumbnail: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
      tags: ["rumah-kosong", "kontrakan", "setan"],
      blocks: [
        { type: "text", data: { text: "Hari ke-14 catatan gue. Tiap malem Jumat, lampu lantai 2 rumah sebelah nyala. Padahal udah gak ada yang tinggal di sana sejak Pak Harto meninggal 3 tahun lalu." }, order: 0 },
        { type: "diary", data: { paragraphs: [
          "Pekan 1: Gue kira ada maling. Gue lapor RT. Dia cek, kunci rumah masih segel, listrik udah diputus. Tapi lampu tetap nyala.",
          "Pekan 2: Tetangga sebelah juga ngeliat. Mereka pindah minggu depannya.",
          "Pekan 3: Gue foto dari jendela. Hasilnya — bayangan perempuan di tirai lantai 2. Sama tiap malem Jumat.",
          "Pekan 4: Gue cari info ke warga lama. Konon, Bu Harto (alm) suka banget nyalain lampu kamar dia tiap malem Jumat buat nunggu anaknya yang pergi sejak 1985.",
        ], datetime: "Catatan Oktober 2024", observedBy: "Sinta L."}, order: 1 },
        { type: "image", data: { imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200", caption: "Rumah tua dengan satu jendela menyala" }, order: 2 },
        { type: "text", data: { text: "Sekarang gue udah pindah kontrakan. Tapi tiap malem Jumat, gue masih kepikiran. Bu Harto masih nunggu, mungkin sampai kapanpun." }, order: 3 },
      ],
    },
    {
      title: "Chat WA dari Nomor yang Udah Mati",
      excerpt: "Pacar gue meninggal 6 bulan lalu. Tapi tadi malam, dia chat gue...",
      authorIdx: 3,
      categorySlug: "pengalaman-pribadi",
      templateSlug: "chat-whatsapp",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200",
      tags: ["chat", "pacar", "meninggal"],
      blocks: [
        { type: "text", data: { text: "Gue gak pernah share ini ke siapapun. Tapi ini terjadi 2 minggu lalu, dan gue butuh keluarkan." }, order: 0 },
        { type: "chat", data: { messages: [
          { from: "them", name: "Dinda 💕", text: "Sayang, udah makan belum?", time: "23:14" },
          { from: "me", text: "Dinda??? Lo kan...", time: "23:15" },
          { from: "them", name: "Dinda 💕", text: "Aku kangen banget. Janji kamu aku jemput kalo udah waktunya ya.", time: "23:16" },
          { from: "me", text: "Lo dari mana???", time: "23:17" },
          { from: "them", name: "Dinda 💕", text: "Di sini gelap. Tapi tenang, aku gak sendirian.", time: "23:18" },
          { from: "me", text: "Dinda jangan bikin gue takut", time: "23:19" },
          { from: "them", name: "Dinda 💕", text: "Ssshh... dia liat kamu kok. Di belakang.", time: "23:20" },
        ]}, order: 1 },
        { type: "text", data: { text: "Gue langsung liat ke belakang. Kosong. Tapi lampu kamar kedip-kedip beberapa detik.\n\nGue coba telpon nomor itu — mati. Sudah mati sejak 6 bulan lalu, pas Dinda kecelakaan.\n\nSampai sekarang, gak ada chat lagi. Tapi tiap malem, gue ngecek HP dengan takut." }, order: 2 },
      ],
    },
    {
      title: "File Kasus 47-B: Hilangnya Siswa SMAN 12",
      excerpt: "Dokumen internal yang bocor. Investigasi polisi kasus siswa hilang di sekolah tua.",
      authorIdx: 0,
      categorySlug: "sekolah",
      templateSlug: "police-case",
      thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200",
      tags: ["sekolah", "hilang", "polisi"],
      blocks: [
        { type: "text", data: { text: "Ini dokumen yang gue dapet dari teman yang kerja di kepolisian. Identitas udah di-redact." }, order: 0 },
        { type: "police", data: {
          caseNumber: "47-B/2024",
          classification: "RAHASIA — INTERNAL USE ONLY",
          location: "SMAN 12 [REDACTED]",
          datetime: "14 Maret 2024, 21:30 WIB",
          observedBy: "Detektif [REDACTED]",
          readings: [
            { label: "Siswa Hilang", value: "1 orang", status: "critical" },
            { label: "Saksi", value: "3 siswa", status: "warning" },
            { label: "CCTV Aktif", value: "4 dari 12", status: "warning" },
            { label: "Pencarian", value: "Day 14", status: "critical" },
          ],
          paragraphs: [
            "Korban: [REDACTED], 16, kelas X-3. Terakhir dilihat di lantai 3 gedung B pada 21:30.",
            "Saksi 1: 'Dia bilang mau ke kamar mandi. Tapi kamar mandi lantai 3 udah dikunci 2 tahun lalu.'",
            "Saksi 2: 'Aku denger suara orang ketawa dari kamar mandi itu. Terus kediaman.'",
            "Catatan: CCTV lantai 3 mati 15 menit sebelum kejadian. Rekaman dari kamera tangga menunjukkan sosok tidak dikenal mengikuti korban.",
          ],
        }, order: 1 },
        { type: "image", data: { imageUrl: "https://images.unsplash.com/photo-1568871391783-83f7a36dfe23?w=1200", caption: "Gedung B SMAN 12 (foto lama)" }, order: 2 },
        { type: "quote", data: { text: "Kamar mandi lantai 3 itu dikunci karena sebab yang tidak akan kami publikasikan. Tolong jangan paksakan masuk.", author: "Kepala Sekolah, 2022" }, order: 3 },
        { type: "text", data: { text: "Kasus masih open sampai sekarang. Korban belum ditemukan. Pencarian dihentikan minggu ke-3." }, order: 4 },
      ],
    },
    {
      title: "CCTV Lantai 4: Footage yang Gak Pernah Tayang",
      excerpt: "Rekaman CCTV yang beredar terbatas di kalangan security. Yang ini bikin gue gak tidur seminggu.",
      authorIdx: 0,
      categorySlug: "misteri",
      templateSlug: "cctv-report",
      thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200",
      tags: ["cctv", "lifting", "hantu"],
      blocks: [
        { type: "text", data: { text: "Gue kerja sebagai security di salah satu mall di Jakarta. Ini rekaman yang gue dapet dan gak pernah dilaporkan ke atasan." }, order: 0 },
        { type: "cctv", data: {
          caseNumber: "CCTV-L4-0247",
          classification: "INTERNAL — SECURITY",
          location: "Lantai 4, Koridor Timur, Dekat Toilet Pria",
          datetime: "11 Februari 2025, 02:14:33 WIB",
          observedBy: "Security B",
          readings: [
            { label: "Durasi Anomali", value: "00:00:47", status: "warning" },
            { label: "Suhu Lantai 4", value: "12°C (normal: 22°C)", status: "critical" },
            { label: "Status Sensor", value: "Tidak terdeteksi", status: "critical" },
          ],
          paragraphs: [
            "02:14:33 — Koridor kosong, lampu emergency menyala redup.",
            "02:14:38 — Sosok perempuan berbaju putih muncul dari pintu toilet. Berjalan ke arah kamera.",
            "02:14:50 — Sosok berhenti tepat di bawah kamera. Wajah menengadah ke atas.",
            "02:15:20 — Sosok menghilang. Lampu koridor kembali normal. Suhu kembali 22°C.",
          ],
        }, order: 1 },
        { type: "image", data: { imageUrl: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=1200", caption: "Screenshot CCTV (identity protected)" }, order: 2 },
        { type: "text", data: { text: "Gue udah sering denger cerita lifting dari rekan security. Tapi liat langsung di rekaman, kerasa beda banget. Sekarang gue minta pindah shift pagi." }, order: 3 },
      ],
    },
    {
      title: "Laporan Investigasi: Rumah Pohon di Belakang Sekolah",
      excerpt: "Tim paranormal masuk ke rumah pohon yang konan jadi tempat ritual. EMF reading off the charts.",
      authorIdx: 1,
      categorySlug: "ritual",
      templateSlug: "paranormal",
      thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
      tags: ["paranormal", "ritual", "rumah-pohon"],
      blocks: [
        { type: "text", data: { text: "Laporan resmi dari tim Paranormal Indonesia Research. Identitas lokasi disamarkan sesuai kesepakatan." }, order: 0 },
        { type: "investigation", data: {
          caseNumber: "PIR-2024-034",
          classification: "INTERNAL — RESEARCH",
          location: "Rumah Pohon, [REDACTED], Jawa Barat",
          datetime: "22 Maret 2024, 23:00 - 03:00 WIB",
          observedBy: "Tim PIR Alpha (4 anggota)",
          readings: [
            { label: "EMF Tertinggi", value: "84.3 mG (normal: <2.5)", status: "critical" },
            { label: "Suhu Terendah", value: "9°C (normal: 24°C)", status: "critical" },
            { label: "EVP Recorded", value: "12 clip", status: "warning" },
            { label: "Foto Anomali", value: "7 frame", status: "warning" },
          ],
          paragraphs: [
            "23:15 — Suhu turun drastis saat masuk radius 5 meter dari rumah pohon.",
            "23:30 — EMF meter menyala merah terus. Sensor di lantai rumah pohon tidak berfungsi.",
            "00:45 — Anggota B melihat sosok anak kecil di jendela rumah pohon. Tidak terfoto.",
            "01:30 — EVP: 'Tolong aku, masih di sini.'",
            "02:50 — Sesi dihentikan. Suhu kembali normal, EMF turun ke 1.8 mG.",
          ],
        }, order: 1 },
        { type: "image", data: { imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200", caption: "Akses menuju rumah pohon" }, order: 2 },
        { type: "quote", data: { text: "Kami menyarankan lokasi ini tidak dimasuki tanpa pengawasan. Energi di sini sangat aktif dan tidak stabil.", author: "Lead Investigator PIR" }, order: 3 },
      ],
    },
    {
      title: "Berita: 5 Siswa Pingsan Saat Outing Sekolah di Pantai",
      excerpt: "Kasus yang viral bulan lalu. Versi resmi keracunan, tapi saksi mata cerita beda.",
      authorIdx: 0,
      categorySlug: "rumah-sakit",
      templateSlug: "news-report",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
      tags: ["pantai", "sekolah", "pingsan"],
      blocks: [
        { type: "text", data: { text: "Berita yang dipublikasikan di media lokal, dengan tambahan sumber saksi mata yang tidak dimuat." }, order: 0 },
        { type: "news", data: {
          caseNumber: "PANTAI-2024-11",
          classification: "BERITA — UMUM",
          location: "Pantai [REDACTED], Banten",
          datetime: "15 November 2024",
          observedBy: "Reporter Lapangan",
          paragraphs: [
            "JAKARTA — Lima siswa SMP ditemukan pingsan secara bersamaan saat acara outing sekolah di Pantai [REDACTED], Banten, Jumat (15/11).",
            "Pihak sekolah menyatakan kemungkinan keracunan makanan. Namun, saksi mata mengaku melima siswa tersebut bermain di batu karang besar sebelum pingsan.",
            "'Mereka main petak umpet di batu itu. Tiba-tiba satu per satu jatuh. Tapi nggak ada yang menjerit,' ujar saksi.",
            "Warga sekitar menyebut batu tersebut dikenal sebagai 'batu pengantin' dan menjadi lokasi ritual pada zaman dulu.",
            "Lima siswa masih dirawat di RSUD terdekat. Dokter menyatakan kondisi mereka stabil namun belum sadarkan diri hingga kabar ini diturunkan.",
          ],
        }, order: 1 },
        { type: "image", data: { imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200", caption: "Pantai lokasi kejadian" }, order: 2 },
        { type: "text", data: { text: "Update terbaru: 3 dari 5 siswa sudah sadar. Tapi mereka menolak bercerita apa yang mereka liat di balik batu itu." }, order: 3 },
      ],
    },
  ];

  for (const s of sampleStories) {
    const author = createdUsers[s.authorIdx];
    const category = getCat(s.categorySlug);
    const template = getTpl(s.templateSlug);
    const slug = s.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);

    const existing = await db.story.findUnique({ where: { slug } });
    if (existing) continue;

    const allText = s.blocks
      .filter((b) => b.type === "text" || b.type === "quote")
      .map((b) => (b.data as any).text ?? "")
      .join(" ");
    const readingTime = Math.max(1, Math.ceil(allText.split(/\s+/).filter(Boolean).length / 200));

    await db.story.create({
      data: {
        slug,
        title: s.title,
        excerpt: s.excerpt,
        thumbnailUrl: s.thumbnail,
        readingTime,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        authorId: author.id,
        categoryId: category.id,
        templateId: template.id,
        viewCount: Math.floor(Math.random() * 5000) + 200,
        likeCount: Math.floor(Math.random() * 800) + 50,
        commentCount: Math.floor(Math.random() * 100) + 5,
        bookmarkCount: Math.floor(Math.random() * 200) + 10,
        tags: {
          connectOrCreate: s.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        blocks: {
          create: s.blocks.map((b) => ({
            type: b.type,
            data: JSON.stringify(b.data ?? {}),
            order: b.order,
          })),
        },
      },
    });
  }

  // ===== Sample comments =====
  console.log("  → Comments");
  const stories = await db.story.findMany({ take: 4 });
  const commentTexts = [
    "Serem banget kak, malam ini gak bisa tidur 😭",
    "Aku pernah ngalamin hal mirip di tempat yang sama. Beneran." ,
    "Lanjut kak, dibikin part 2 dong!",
    "Bukti fotonya mana nih?",
    "Gue pernah lewat situ, emang kerasa aneh.",
    "Mantap ceritanya, autocomplete banget.",
  ];
  for (const story of stories) {
    for (let i = 0; i < 3; i++) {
      const author = createdUsers[(i + 1) % createdUsers.length];
      await db.comment.create({
        data: {
          storyId: story.id,
          authorId: author.id,
          content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        },
      });
    }
  }

  console.log("✅ Seeded Horrorin!");
  console.log("  Login admin: admin@horrorin.id / admin123");
  console.log("  Login user:  rangga@horrorin.id / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
