# Buah Naga Project — Smart Dragon Fruit Monitoring
 
Monorepo untuk proyek IoT monitoring buah naga, dibagi jadi 3 job:
 
| Job | Folder | Tanggung jawab |
|---|---|---|
| 1 | `apps/api` | API + protokol MQTT + broker (Aedes) |
| 2 | `apps/web` | Website (Next.js, full stack: frontend + backend) |
| 3 | `apps/mobile` | Aplikasi Android (Expo/React Native) + QR pairing |
 
Ditambah:
- `packages/shared` — logic dan konvensi yang dipakai bareng semua job
- `tools/simulator` — virtual gateway, simulasi kirim data sensor tanpa hardware asli
---
 
## Struktur folder
 
```
buah-naga-project/
├── docker-compose.yml
├── .gitignore
├── package.json
├── apps/
│   ├── api/
│   ├── web/
│   └── mobile/
├── packages/
│   └── shared/
│       ├── prisma/
│       │   └── schema.prisma
│       ├── db.js
│       ├── mqtt-topics.js
│       ├── temperature-logic.js
│       └── device-validation.js
└── tools/
    └── simulator/
```
 
---
 
## Prasyarat
 
- Node.js versi 20+
- Docker Desktop (wajib untuk Job 1 & Job 2, opsional untuk Job 3)
- Expo Go di HP (untuk Job 3)
- Git versi 2.25+ (untuk sparse-checkout mode `--cone`)
---
 
## Setup awal (semua job)
 
```bash
docker compose up -d      # nyalakan database (skip kalau cuma kerja di mobile)
npm install                # install dependency workspace root
```
 
---
 
## `apps/api` — Job 1 (API + MQTT)
 
**Install dependency:**
```bash
cd apps/api
npm install express aedes aedes-server-factory @prisma/client
npm install --save-dev prisma
```
 
**Buat file `.env`:**
```
DATABASE_URL="postgresql://buah_naga:ganti_password_ini@localhost:5432/buah_naga_db"
JWT_SECRET="ganti_dengan_rahasia_acak"
```
 
**Struktur yang disarankan:**
```
apps/api/
├── index.js          # entry point, jalankan Express + broker
├── broker.js          # setup Aedes MQTT broker
├── routes/
│   └── devices.js      # endpoint REST device
└── middleware/
    └── auth.js          # verifikasi JWT (kalau dipakai)
```
 
**Jalankan:**
```bash
npm run dev
```
 
**Tanggung jawab utama:**
- Bangun broker MQTT (terima data dari simulator/alat asli, port default 1883, aktifkan WebSocket untuk mobile)
- Validasi device ID sebelum data masuk
- Endpoint REST untuk registrasi/pengecekan device
---
 
## `apps/web` — Job 2 (Website full stack, Next.js)
 
**Install:**
```bash
cd apps/web
npx create-next-app@latest .
```
Pilih **recommended defaults** (TypeScript, Tailwind, App Router).
 
**Buat file `.env.local`:**
```
DATABASE_URL="postgresql://buah_naga:ganti_password_ini@localhost:5432/buah_naga_db"
```
 
**Struktur:**
```
apps/web/
├── app/
│   ├── page.tsx           # frontend: dashboard
│   ├── layout.tsx
│   └── api/
│       └── devices/
│           └── route.ts    # backend: endpoint /api/devices
```
 
**Jalankan:**
```bash
npm run dev
```
Buka `http://localhost:3000`.
 
**Tanggung jawab utama:**
- Dashboard tampilkan kondisi tiap panel (A/B/C dst)
- CRUD device (tambah/kelola alat baru)
- Autentikasi user (kalau ada)
---
 
## `apps/mobile` — Job 3 (Android, Expo/React Native)
 
**Install:**
```bash
npx create-expo-app@latest apps/mobile
cd apps/mobile
npm install mqtt
npx expo install expo-camera
```
 
**Buat file `.env` (opsional, hanya kalau alamat broker beda dev/prod):**
```
EXPO_PUBLIC_MQTT_BROKER_URL=ws://ALAMAT_BROKER:PORT/mqtt
```
 
**Jalankan:**
```bash
npx expo start
```
Scan QR di terminal pakai Expo Go.
 
**Tanggung jawab utama:**
- Scan QR untuk pairing device (`expo-camera`)
- Subscribe topic MQTT device yang di-pairing, terima data real-time
- Tampilkan status (aman/waspada/bahaya) pakai logic dari `packages/shared`
- **Tidak** connect langsung ke database — cukup consume API dari `apps/api`/`apps/web` dan data MQTT
---
 
## `packages/shared` — konvensi bersama
 
Isi logic murni (input → proses → output), tanpa dependency database atau platform spesifik, supaya konsisten dipakai di semua job:
 
| File | Fungsi |
|---|---|
| `mqtt-topics.js` | Format nama topic MQTT (`getDeviceTopic`) |
| `temperature-logic.js` | Threshold dan status suhu (aman/waspada/bahaya) |
| `device-validation.js` | Validasi format device ID |
| `prisma/schema.prisma` | Skema database, satu-satunya sumber kebenaran |
| `db.js` | Export instance Prisma Client (dipakai `apps/api` & `apps/web`, **jangan** di mobile) |
 
**Setup:**
```bash
cd packages/shared
npm init -y
npm install @prisma/client
npm install --save-dev prisma
npx prisma generate
npx prisma migrate dev --name init
```
 
**Buat `.env`:**
```
DATABASE_URL="postgresql://buah_naga:ganti_password_ini@localhost:5432/buah_naga_db"
```
 
**Cara import (sesuaikan jumlah `../` dengan kedalaman file):**
```js
const { getDeviceTopic } = require('../../packages/shared/mqtt-topics');
```
 
---
 
## Clone sesuai jobdesk (sparse-checkout)
 
Tiap kolaborator cukup ambil folder job-nya masing-masing **plus** `packages/shared`:
 
```bash
git clone --filter=blob:none --no-checkout <URL_REPO>
cd buah-naga-project
git sparse-checkout init --cone
git sparse-checkout set apps/mobile packages/shared    # ganti sesuai job
git checkout main
```
 
| Job | Command `sparse-checkout set` |
|---|---|
| 1 (api) | `apps/api packages/shared tools/simulator` |
| 2 (web) | `apps/web packages/shared` |
| 3 (mobile) | `apps/mobile packages/shared` |
 
File di root (`docker-compose.yml`, `.gitignore`, `package.json`) otomatis ikut ter-checkout untuk semua orang.
 
---
 
## Catatan penting
 
- Database pakai Docker (`docker-compose.yml` di root) — Job 1 & Job 2 wajib `docker compose up -d` sebelum jalankan app masing-masing
- `.env` **tidak boleh** ke-commit, sudah dikecualikan lewat `.gitignore`
- Semua konvensi (topic MQTT, threshold suhu, format device ID) **wajib** lewat `packages/shared`, jangan didefinisikan ulang sendiri-sendiri di tiap app
 