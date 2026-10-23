# Horrorin — Komunitas Cerita Horror Indonesia

> "Gabun komunitas horror paling ngeri di Indonesia" 👻

Horrorin adalah platform komunitas untuk menulis, membaca, dan berbagi cerita horror berbahasa Indonesia dengan tone Gen Z. Dibangun dengan dark mode + glassmorphism, lengkap dengan editor cerita multi-template, interaksi sosial, serta panel admin.

## Tech Stack

| Teknologi | Keterangan |
| --- | --- |
| [Next.js 16](https://nextjs.org) | App Router, route groups `(auth)` / `(public)` / `(admin)` |
| [React 19](https://react.dev) + TypeScript | UI library |
| [Tailwind CSS 4](https://tailwindcss.com) + shadcn/ui | Styling + komponen (Radix UI, glassmorphism) |
| [Prisma 7](https://www.prisma.io) + PostgreSQL | Database (via `@prisma/adapter-pg`, siap deploy serverless) |
| [NextAuth v4](https://next-auth.js.org) | Auth credentials provider, JWT session, role USER/ADMIN |
| [React Query](https://tanstack.com/query) | Data fetching sisi klien — semua kunci query terdaftar di satu registry |
| [Zod](https://zod.dev) | Validasi skema |
| Sonner, bcryptjs, lucide-react | Toast, hashing password, ikon |

## Fitur

- **15 template cerita** — klasik, timeline, diary, chat-whatsapp, police-case, cctv-report, paranormal, news-report, galeri-foto, split-layout, dan lainnya. Tiap template punya struktur block yang unik dan auto-generate saat dipilih.
- **14 tipe block konten** — text, image, large-image, cover-image, quote, gallery, timeline, chat, conversation, news, police, cctv, investigation, diary.
- **Editor cerita 3-panel** — kiri: daftar & tambah block, tengah: live preview, kanan: properti per block. Mendukung reorder, duplicate, hapus, upload gambar, simpan draft, dan publish.
- **Interaksi sosial** — like, bookmark (simpan), komentar, follow kreator, notifikasi (LIKE / COMMENT / FOLLOW / STORY_PUBLISHED / SYSTEM).
- **Eksplorasi** — trending, terbaru, pencarian, kategori (10 kategori serem siap pakai), daftar kreator.
- **Profil** — halaman profil publik dengan tab Cerita/Draft, edit profil, follow/unfollow.
- **Panel admin** — dashboard statistik, kelola user (promote/demote admin, ban/unban), kelola cerita (archive/delete), laporan.

## Halaman

| Route | Deskripsi |
| --- | --- |
| `/masuk` | Login |
| `/gabung` | Registrasi |
| `/lupa-password` | Lupa password |
| `/` | Home — hero cerita, trending, kategori |
| `/cerita/[slug]` | Detail cerita (render semua tipe block) |
| `/editor` | Editor cerita (auth) |
| `/trending` `/terbaru` | Daftar cerita trending & terbaru |
| `/kategori` `/kategori/[slug]` | Semua kategori & cerita per kategori |
| `/cari` | Pencarian cerita |
| `/kreator` | Daftar kreator |
| `/u/[username]` | Profil publik kreator |
| `/notifikasi` `/simpan` | Notifikasi & bookmark (auth) |
| `/admin` | Dashboard admin (role ADMIN) |
| `/admin/users` | Kelola user |
| `/admin/stories` | Kelola cerita |
| `/admin/reports` | Laporan |

## API

Semua handler REST berada di `src/app/api`:

- **`/api/public`**
  - `stories` — list (filter sort/category/tag/q), `[slug]` detail, `create` (GET draft + POST buat + PATCH update), `me`, `related/[slug]`, `like`, `bookmark` (+ `bookmark/list`).
  - `home` — payload landing gabungan (cerita latest/trending/recommended + kategori + kreator top) dalam **satu request**.
  - `comments/[storyId]` — daftar & komentar baru; `comments?slug=` — daftar komentar lewat slug (dipakai halaman detail agar 3 request jalan paralel).
  - `categories`, `templates`.
  - `profile/me` (update), `profile/[username]`, `profile/follow`.
  - `notifications`, `notifications/read` (POST tanda baca), `notifications/unread-count` (badge navbar).
  - `upload` (POST data URL gambar ≤3MB) dan `files/[id]` (melayani gambarnya).
  - `auth/register`.
- **`/api/admin`** — `users` (+`[id]` promote/demote/ban/unban), `stories` (+`[id]` archive/delete), `stats` (dashboard agregat angka sesungguhnya dalam satu request).
- **`/api/auth`** — NextAuth handlers (`[...nextauth]`).

Data layer memakai repository pattern di `src/repositories` (story, user, engagement, notification, template).

## Arsitektur Data (sisi klien)

Semua panggilan jaringan lewat modul `src/lib/api/*`:

- `client.ts` — `fetch` tunggal pembungkus JSON, query string, dan error (`ApiError` berisi status + body).
- Satu modul per domain (`stories.ts`, `home.ts`, dst.) berisi endpoint + factory `queryOptions`.
- `src/lib/query-keys.ts` — registry kunci query terpusat; invalidasi harus lewat factory di registry ini.

Aturan lint (`eslint.config.mjs`) memblokir `fetch` di luar modul `lib/api` dan kunci query yang ditulis manual — biar data tetap konsisten lewat satu pintu.

Praktik caching:

- Default `staleTime` 60 detik, `refetchOnWindowFocus` mati (React Query & sesi NextAuth).
- Bacaan lambat berubah lebih rileks: list cerita & detail (`2 menit`), kategori (`5 menit`), payload home (`2 menit`).
- Data milik user (draft, bookmark, notifikasi, admin) tetap 60 detik — sering berubah.
- Aksi user (like, bookmark, komentar, simpan draft) memicu invalidasi presisi: badge, payload home, list, dan detail terkait, tanpa merefresh halaman lain.

Efeknya, beban request turun:

| Halaman | Sebelum | Sesudah (login) |
| --- | --- | --- |
| `/` | ±7 data request | 1 (payload home) + badge + sesi |
| `/cerita/[slug]` | 4–5 request berantai | 3 paralel + badge + sesi |
| `/admin` | 2 list query | 1 (`/admin/stats`) |

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/          # masuk, gabung, lupa-password
│   ├── (public)/        # home, cerita, editor, kategori, cari, kreator, dst.
│   ├── (admin)/         # admin dashboard, users, stories, reports
│   └── api/             # public + admin + nextauth handlers
├── auth/                # NextAuth options & session helpers
├── components/
│   ├── editor/          # story editor 3-panel
│   ├── layout/          # navbar, footer, app-shell, admin-nav
│   ├── story/           # story card & block renderer
│   └── ui/              # shadcn/ui components
├── constants/           # kategori & template cerita
├── hooks/               # use-toast, use-mobile
├── lib/                 # prisma client + pool, modul API client, registry query-keys
├── repositories/        # data layer (story, user, engagement, dst.)
├── types/               # type global & next-auth type extension
└── utils/               # helper format
```

## Mulai Cepat

### Prasyarat

- Node.js 20+ (atau Bun)
- PostgreSQL berjalan lokal

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Buat file `.env` di root project:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/horrorin"
   DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/horrorin"
   NEXTAUTH_SECRET="ganti-dengan-secret-acak"
   ```

3. Siapkan database & seed data awal:

   ```bash
   npm run db:generate       # generate Prisma client
   npm run db:migrate        # jalankan migrasi Prisma (folder prisma/migrations)
   npx tsx prisma/seed.ts    # seed kategori, template, user & cerita
   ```

   Perlu diingat: seed juga tersedia lewat `prisma migrate reset` (`npm run db:reset`, opsi `--skip-seed` untuk melewati seeding) — konfigurasi seed terdaftar di `prisma.config.ts`.

4. Jalankan server development:

   ```bash
   npm run dev
   ```

Buka [http://localhost:3000](http://localhost:3000) 🎉

### Akun Demo (hasil seed)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@horrorin.id` | `admin123` |
| User | `rangga@horrorin.id` `maya@horrorin.id` `bayu@horrorin.id` `sinta@horrorin.id` | `password123` |

## Scripts

| Perintah | Deskripsi |
| --- | --- |
| `npm run dev` | Jalankan server development |
| `npm run build` | Build production (prisma generate + next build) |
| `npm run start` | Jalankan server production |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:push` | Push schema Prisma ke database |
| `npm run db:reset` | Reset database + jalankan seed |

## Catatan

- Seluruh UI berbahasa Indonesia dengan tone Gen Z.
- `Caddyfile` di root dipakai sebagai reverse proxy (default `:81` → `localhost:3000`), mendukung per-rute transform port lewat query `XTransformPort`.
- Deploy serverless (Vercel): pool koneksi `pg` di `src/lib/db.ts` menyesuaikan otomatis (maks 3 koneksi per lambda, bisa dioverride lewat env `PG_POOL_MAX`).
- Deploy production: `bun run build` TIDAK menjalankan migrasi (hanya `prisma generate` + `next build`). Jalankan `bunx prisma migrate deploy` ke database production (pakai `DIRECT_URL`) sebelum/sesudah deploy — tabel `Upload` dan indeks composite baru wajib sudah ada sebelum app kena DB.
- Gambar editor tersimpan di tabel `Upload` (bukan filesystem — filesystem serverless read-only) dan dilayani `/api/public/files/[id]` dengan id acak sebagai capability.
- Indeks composite untuk urutan sort cerita & notifikasi ada di `prisma/migrations/20261023010936_story_notification_sort_indexes`.
- Log pengembangan ada di `worklog.md` (bisa jadi tidak mutakhir — kode tetap sumber kebenarannya).
