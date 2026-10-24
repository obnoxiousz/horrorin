# API Horrorin

Referensi route handler yang tersedia di `src/app/api`. Semua path di bawah relatif terhadap origin aplikasi, misalnya `http://localhost:3000`.

## Konvensi

- Endpoint JSON menerima dan mengembalikan JSON kecuali endpoint file.
- Autentikasi menggunakan cookie sesi NextAuth. Login dilakukan melalui `/api/auth/callback/credentials`; klien browser umumnya mengelola sesi melalui NextAuth.
- Endpoint bertanda **Login** memerlukan sesi aktif. Endpoint bertanda **Admin** memerlukan sesi dengan role `ADMIN`.
- Error JSON umumnya berbentuk `{ "error": "..." }`. Pemeriksaan akses menghasilkan `401` jika belum login dan `403` jika bukan admin.
- Bentuk record yang disertakan (contohnya author, category, blocks) bergantung pada endpoint; di bawah dicantumkan payload dan field utama yang disusun handler.

## Pemeriksaan layanan

### `GET /api`

Mengembalikan `{ "message": "Hello, world!" }`.

## Publik

### Beranda dan katalog

| Metode dan path | Keterangan |
| --- | --- |
| `GET /api/public/home` | Payload beranda: `latest`, `trending`, `recommended`, `categories`, `creators`. Cerita menyertakan flag `liked` dan `bookmarked` untuk pengguna yang login. |
| `GET /api/public/categories` | Mengembalikan `{ categories, templates }`. |
| `GET /api/public/templates` | Mengembalikan `{ templates }`. |

### Cerita

#### `GET /api/public/stories`

Daftar cerita berstatus terbit. Parameter query opsional:

| Parameter | Default | Keterangan |
| --- | --- | --- |
| `sort` | `latest` | `latest`, `trending`, atau `recommended` |
| `category` | — | Slug kategori |
| `tag` | — | Nama tag |
| `q` | — | Kata pencarian |
| `skip` | `0` | Jumlah record yang dilewati |
| `take` | `12` | Jumlah record yang diminta |

Respons: `{ "stories": [...] }`. Setiap cerita menyertakan `liked` dan `bookmarked` sesuai sesi bila pengguna login. Nilai pagination dan sort diteruskan ke repository tanpa validasi tambahan di route.

#### Endpoint cerita lainnya

| Metode dan path | Akses | Keterangan |
| --- | --- | --- |
| `GET /api/public/stories/[slug]` | Publik | Detail cerita terbit; menaikkan view count secara asynchronous. Respons `{ story }`, termasuk flag `liked` dan `bookmarked`. `404` jika tidak ditemukan atau belum terbit. |
| `GET /api/public/stories/related/[slug]` | Publik | Cerita terkait. Respons `{ stories }`. |
| `GET /api/public/stories/me` | Login | Cerita milik pengguna. Respons `{ stories }`. |
| `GET /api/public/stories/bookmark/list` | Login | Cerita yang disimpan pengguna. Respons `{ bookmarks }`. |
| `POST /api/public/stories/like` | Login | Toggle like. Body `{ "storyId": "..." }`; respons mengikuti hasil toggle repository. `400` jika `storyId` kosong. |
| `POST /api/public/stories/bookmark` | Login | Toggle bookmark. Body `{ "storyId": "..." }`; respons mengikuti hasil toggle repository. `400` jika `storyId` kosong. |

#### Membuat dan mengedit cerita

Semua operasi pada `/api/public/stories/create` memerlukan login.

| Metode | Parameter/body | Hasil |
| --- | --- | --- |
| `GET` | Query `id` berisi ID cerita | `{ story }` jika cerita milik pengguna ditemukan; selain itu `404`. |
| `POST` | Body cerita baru (lihat di bawah) | Membuat cerita dan mengembalikan `{ story }`. Status awal mengikuti `status`, default `DRAFT`. |
| `PATCH` | Body berisi `id` dan field cerita yang ingin diubah | Memperbarui cerita milik pengguna dan mengembalikan `{ story }`. `400` jika `id` tidak ada; `404` jika tidak ditemukan atau bukan milik pengguna. |

Body `POST` memerlukan `title` (3–120 karakter), `categoryId`, serta `blocks` (array berisi `type`, `data`, `order`). Field opsional: `excerpt` (maks. 280 karakter), `templateId`, `templateSlug`, `thumbnailUrl`, `tags` (array string), dan `status` (`DRAFT` atau `PUBLISHED`).

Contoh:

```json
{
  "title": "Suara dari Kamar Kosong",
  "excerpt": "Cerita pendek tentang penghuni lama.",
  "categoryId": "category-id",
  "templateSlug": "classic",
  "tags": ["kosong", "malam"],
  "blocks": [
    { "type": "text", "data": { "text": "Malam itu..." }, "order": 0 }
  ],
  "status": "DRAFT"
}
```

Pada `PATCH`, field yang dikirim diperbarui. `blocks` yang disertakan menggantikan seluruh block; `tags` yang disertakan menggantikan seluruh tag. Perubahan judul menghasilkan slug baru.

### Komentar

| Metode dan path | Akses | Keterangan |
| --- | --- | --- |
| `GET /api/public/comments?slug=[slug]` | Publik | Daftar komentar berdasarkan slug cerita. Jika `slug` tidak diberikan, respons `{ "comments": [] }`. |
| `GET /api/public/comments/[storyId]` | Publik | Daftar komentar berdasarkan ID cerita. Respons `{ comments }`. |
| `POST /api/public/comments/[storyId]` | Login | Body `{ "content": "...", "parentId": "..." }`; `parentId` opsional. Respons `{ comment }`; `400` jika isi kosong. |

### Akun dan profil

| Metode dan path | Akses | Keterangan |
| --- | --- | --- |
| `POST /api/public/auth/register` | Publik | Membuat akun. Body `{ name, email, username, password }`; username 3–20 karakter dan hanya huruf kecil, angka, underscore; password minimal 6 karakter. Respons `{ ok: true, user }`; `400` untuk input tidak valid, `409` jika email atau username sudah dipakai. |
| `GET /api/public/profile/[username]` | Publik | Profil publik dan cerita terbit. Respons `{ profile, stories }`; `404` jika username tidak ditemukan. |
| `GET /api/public/profile/me` | Login | Profil pengguna aktif beserta jumlah follower/following. Respons `{ user }`. |
| `PATCH /api/public/profile/me` | Login | Mengubah field yang dikirim: `name`, `username`, `image`, `bio`. Respons `{ user }`. |
| `POST /api/public/profile/follow` | Login | Toggle follow. Body `{ "targetUserId": "..." }`; respons `{ "following": true }` atau `{ "following": false }`. `400` jika ID kosong atau ID diri sendiri. |

### Notifikasi

| Metode dan path | Akses | Keterangan |
| --- | --- | --- |
| `GET /api/public/notifications` | Login | Maksimal 30 notifikasi terbaru dan jumlah belum dibaca. Respons `{ notifications, unread }`; notifikasi dilengkapi `actor` dan `story` bila tersedia. |
| `GET /api/public/notifications/unread-count` | Login | Respons `{ unread }`. |
| `POST /api/public/notifications/read` | Login | Body opsional `{ "ids": ["..."] }`; menandai notifikasi sesuai ID sebagai sudah dibaca. Tanpa `ids`, repository menandai seluruh notifikasi pengguna. Respons `{ "ok": true }`. |

### Upload dan file

#### `POST /api/public/upload` (Login)

Body JSON: `{ "dataUrl": "data:image/png;base64,..." }`. Format yang didukung: PNG, JPEG, WebP, GIF. Ukuran maksimum per file 3 MB; kuota 50 upload dan total penyimpanan 100 MB per pengguna.

Respons sukses: `{ "url": "/api/public/files/[id]" }`.

Error utama: `400` untuk data/format salah, `413` untuk ukuran atau kuota total, `415` untuk tipe atau isi file tidak didukung, `429` jika jumlah upload sudah mencapai batas.

#### `GET /api/public/files/[id]`

Mengembalikan byte gambar dengan `Content-Type` sesuai file dan cache immutable selama satu tahun. `404` jika ID tidak ditemukan. File dapat diakses publik menggunakan ID upload.

## Autentikasi NextAuth

### `/api/auth/[...nextauth]`

NextAuth v4 menangani `GET` dan `POST` pada endpoint ini. Login credentials memakai `email` dan `password`; akun yang diblokir tidak dapat login. Untuk endpoint session-protected, kirim cookie sesi NextAuth yang sama dengan sesi browser.

## Admin

Semua endpoint admin memerlukan role `ADMIN`.

| Metode dan path | Parameter/body | Hasil |
| --- | --- | --- |
| `GET /api/admin/stats` | — | Statistik user, cerita berdasarkan status, jumlah view/like/komentar, dan 5 cerita terbaru. |
| `GET /api/admin/users?q=[kata]` | Query `q` opsional | Maksimal 50 user yang cocok. Respons `{ users }`. |
| `PATCH /api/admin/users/[id]` | `role` dan/atau `banned` | Memperbarui role atau status blokir user. Respons `{ user }`. |
| `DELETE /api/admin/users/[id]` | — | Memblokir user (setara `banned: true`), bukan menghapus record. Respons `{ "ok": true }`. |
| `GET /api/admin/stories` | — | Maksimal 100 cerita terbaru. Respons `{ stories }`. |
| `PATCH /api/admin/stories/[id]` | `{ "status": "..." }` | Memperbarui status cerita. Respons `{ story }`. |
| `DELETE /api/admin/stories/[id]` | — | Menghapus cerita. Respons `{ "ok": true }`. |

Route admin meneruskan sebagian nilai (misalnya `role` dan `status`) ke repository/database tanpa validasi enum pada handler. Gunakan nilai status/role yang diterapkan aplikasi, seperti `USER`, `ADMIN` dan `DRAFT`, `PUBLISHED`, `ARCHIVED`.
