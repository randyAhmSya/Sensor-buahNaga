# AgroLight: Dragon Fruit Smart Farming Dashboard

AgroLight adalah platform dashboard B2B SaaS agritech yang dirancang untuk otomasi penyinaran lampu LED tanaman buah naga (*Hylocereus polyrhizus*). Platform ini membantu petani mengelola siklus pencahayaan cerdas (*auto-dimming*), memantau telemetri sensor lingkungan secara *real-time*, memproyeksikan estimasi panen fase bunga, serta mengelola kode QR untuk *pairing* node sensor IoT di lapangan.

---

## 🚀 Fitur Utama

- **Dashboard Utama & Telemetri**: Pemantauan langsung status blok lahan, live telemetri node (*lux*, konsumsi daya, konektivitas), grafik auto-dimming malam hari, serta ringkasan *countdown* panen.
- **Manajemen Kebun & Blok**: Struktur hierarkis kebun dan pemetaan blok lahan lengkap dengan rincian luas area dan modul sensor.
- **Jadwal Lampu Cerdas**: Konfigurasi siklus nyala-padam, target intensitas lampu, serta riwayat log penyesuaian otomatis peredupan (*auto-dimming*) berbasis lux sensor.
- **Estimasi Panen**: Perhitungan proyeksi tanggal panen otomatis berdasarkan tanggal awal induksi penyinaran lampu dan target hari munculnya bunga, disertai pencatatan panen aktual.
- **Kelola QR Code**: Pembuatan QR Code blok lahan dengan alur *cascading selection* (Kebun → Blok), pratinjau kartu blok, serta fungsionalitas unduh/cetak label untuk pemasangan sensor di lahan.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) 18+ / [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (pendekatan *Clean Minimalist Outline*)
- **Routing**: [React Router](https://reactrouter.com/) (v6)
- **Validasi Skema**: [Zod](https://zod.dev/)
- **Ikonografi**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 📂 Struktur Direktori

Arsitektur aplikasi menggunakan pola modular berbasis fitur (*feature-driven architecture*):

```text
src/
├── components/ # Komponen global & atomik (Button, CustomSelect, StatusBadge)
├── data/       # Data terpusat (centralData.ts, mockSchedules, mockHarvests)
├── features/   # Modul fitur terisolasi
│   ├── dashboard/ # Dashboard utama, telemetri, & ringkasan operasional
│   ├── farms/     # Manajemen kebun dan detail blok
│   ├── harvests/  # Estimasi siklus panen & pencatatan aktual
│   ├── qrcodes/   # Pembuatan, pratinjau, & manajemen QR Code
│   └── schedules/ # Pengaturan jadwal lampu & grafik auto-dimming
├── layouts/    # DashboardLayout, Sidebar navigasi, & Header
├── routes/     # Konfigurasi router utama (AppRoutes)
└── services/   # Service layer terpusat (api.ts) untuk integrasi backend
```

---

## ⚙️ Panduan Menjalankan Proyek

### 1. Prasyarat
- [Node.js](https://nodejs.org/) (versi 18.x atau lebih baru)
- Package manager: npm, yarn, atau pnpm

### 2. Instalasi Dependensi
Clone repositori dan pasang seluruh dependensi:
```bash
npm install
```

### 3. Menjalankan Server Pengembangan (Dev)
Jalankan dev server lokal:
```bash
npm run dev
```
Buka URL lokal yang muncul pada terminal (biasanya `http://localhost:5173`) di browser.

### 4. Pengecekan Tipe TypeScript
Jalankan type-check untuk memastikan integritas kode:
```bash
npx tsc -b
```

### 5. Build Produksi
Kompilasi kode sumber ke folder `dist/`:
```bash
npm run build
npm run preview
```

---

## 🔌 Kesiapan Integrasi Backend
Aplikasi ini telah memisahkan lapisan UI dan data melalui Service Abstraction di `src/services/api.ts`. Ketika backend REST API (Express & PostgreSQL) telah siap, integrasi cukup dilakukan dengan memperbarui pemanggilan endpoint pada layer service tersebut tanpa perlu mengubah kode komponen UI.

---

## 🌐 Panduan Konfigurasi Server Produksi (Apache .htaccess)

Untuk deployment di server web Apache, gunakan konfigurasi berikut (letakkan berkas `.htaccess` di root web server atau virtual host, bukan di direktori `public/` repositori agar tidak menimpa build):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  # Header cache panjang (immutable) hanya berlaku untuk aset ber-hash di direktori /assets/
  <FilesMatch "\.(js|css|woff2|webp)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
  </FilesMatch>

  # Berkas index.html dan berkas bernama tetap di root (mis. robots.txt, llms.txt) tidak boleh di-cache permanen
  <FilesMatch "(index\.html|robots\.txt|llms\.txt)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>
```

Catatan: Header cache panjang (immutable) hanya boleh diterapkan pada berkas ber-hash di `/assets/`. Jangan menerapkan cache panjang pada `index.html` dan berkas statis bernama tetap di root (`robots.txt`, `llms.txt`).

---

## 📋 Catatan TODO Domain & SEO
- [ ] Konfigurasi `og:url` pada meta tag Open Graph setelah domain produksi resmi ditetapkan.
- [ ] Konfigurasi `og:image` dengan URL absolut gambar preview sosial media 1200x630 setelah domain aktif.
- [ ] Tambahkan tag `<link rel="canonical">` per rute setelah URL kanonikal final tersedia.

