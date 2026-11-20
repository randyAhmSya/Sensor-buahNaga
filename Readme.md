# AgroLight: Otomasi Pencahayaan Buah Naga

AgroLight adalah platform B2B SaaS untuk mengotomasi lampu penyinaran malam pada budidaya buah naga. Sensor lux di lahan mengirim data lewat MQTT, server menghitung peredupan otomatis (*auto-dimming*) sesuai jadwal dan target lux, lalu petani memantau semuanya dari web dan aplikasi Android.

Proyek magang D-IV Teknologi Rekayasa Perangkat Lunak, Politeknik Negeri Banyuwangi.

## Komponen

| Komponen | Folder | Teknologi |
|---|---|---|
| Backend API | `apps/web/backend-sensor` | Laravel 13, PHP 8.3, PostgreSQL, Sanctum, MQTT |
| Web | `apps/web/front-end` | React + Vite + TypeScript, Tailwind v4, TanStack Query |
| Mobile | `apps/mobile` | Expo SDK 57, React Native, NativeWind |
| Sensor virtual | di luar repo ini | Python + Mosquitto (simulasi tanpa perangkat keras) |

Dokumentasi tiap bagian ada di README masing-masing:
[backend](apps/web/backend-sensor/README.md), [web](apps/web/front-end/README.md), [mobile](apps/mobile/README.md).

## Alur singkat

```
Sensor / simulator --MQTT--> Mosquitto --> php artisan mqtt:listen --> PostgreSQL
                                                                         |
Web (React)  <---- REST API (Laravel + Sanctum, per tenant) -------------+
Mobile (Expo) <---------------------------------------------------------+
```

- Setiap data dibatasi per tenant. Akses kebun dicek lewat Policy dan `tenant_id`.
- Kode QR perangkat hanyalah pengenal, bukan rahasia. Keamanannya ada di autentikasi, Policy, pengecekan tenant, log pemindaian (`qr_scan_logs`), dan pembatas laju.
- Log peredupan otomatis hanya dibuat saat jadwal berada dalam mode auto, ada target lux, ada telemetri masuk, node online, dan waktu berada di jendela nyala lampu.

## Prasyarat

- PHP 8.3+, Composer, dan PostgreSQL 16 (bisa lewat `docker compose up -d` di root repo)
- Node.js 20+
- Mosquitto (broker MQTT)
- Expo Go atau perangkat Android untuk mobile
- Git 2.25+ (repo ini memakai sparse-checkout)

## Menjalankan secara lokal

1. **Backend.** Ikuti langkah di [README backend](apps/web/backend-sensor/README.md). Singkatnya: `composer install`, salin `.env.example` menjadi `.env`, isi koneksi database, lalu `php artisan key:generate`, `php artisan migrate --seed`, dan `php artisan storage:link`.
2. **Listener MQTT.** Di folder backend jalankan `php artisan mqtt:listen`.
3. **Web.** Di `apps/web/front-end` jalankan `npm install` lalu `npm run dev`.
4. **Mobile.** Di `apps/mobile` jalankan `npm install` lalu `npx expo start`.

## Pengujian

| Bagian | Perintah |
|---|---|
| Backend | `php artisan config:clear` lalu `php artisan test` |
| Web | `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` |
| Mobile | `npx expo lint` |

## Catatan penting

- **Penyimpanan file.** Foto kebun dan blok disimpan di `storage/app/public` dan dibuka lewat `/storage`, jadi `php artisan storage:link` wajib dijalankan di setiap mesin baru. Bukti transfer disimpan privat di `storage/app/private`.
- **Batas upload.** Foto: JPEG, PNG, JPG, atau WebP, maksimal 2 MB dan 4096 px. Naikkan `upload_max_filesize` dan `post_max_size` di `php.ini` XAMPP (bawaan 2M) agar batas Laravel yang berlaku.
- **Langganan.** Saklar `LANGGANAN_WAJIB` (`true` secara bawaan) menentukan apakah langganan aktif diwajibkan.
- **Zona waktu.** Jendela nyala lampu mengikuti `LAMPU_TIMEZONE` (bawaan `Asia/Jakarta`).
- **Tugas terjadwal.** Pengingat langganan habis (08:00) dan pemangkasan data lama (`lampu:pangkas-data`, 03:00) berjalan lewat `php artisan schedule:run` yang dipicu tiap menit.
- **Peringatan.** `docker-compose.yml` hanya untuk pengembangan lokal. Ganti kata sandi database sebelum dipakai di tempat lain.


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
 