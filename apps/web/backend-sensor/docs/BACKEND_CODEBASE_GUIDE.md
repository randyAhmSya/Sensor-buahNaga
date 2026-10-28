# 🛠️ Internal Backend Codebase & Architecture Guide

Dokumen ini disusun sebagai panduan arsitektur internal, peta navigasi berkas, dan petunjuk orientasi (*onboarding*) teknis untuk seluruh software engineer backend yang bergabung dalam proyek **AgroLight** (Backend Sensor & Sistem Otomasi Perkebunan Buah Naga).

---

## 1. Architectural Overview

### A. Architectural Pattern
Codebase ini dibangun di atas **Laravel 11 / PHP 8.5** menggunakan **Layered Architecture (Service-Oriented Pattern)** dengan pemisahan tanggung jawab yang ketat:
1. **Routing & Middleware Layer (`routes/`, `app/Http/Middleware/`):** Bertanggung jawab atas terminasi rute HTTP, otentikasi sesi Sanctum, otorisasi RBAC (`superAdmin` vs `petani_biasa`), verifikasi tenant aktif (`EnsureTenantAktif`), dan pembatasan fitur berbayar berdasarkan masa aktif langganan (`EnsureLanggananAktif`).
2. **Request Validation Layer (`app/Http/Requests/`):** Mengisolasi seluruh aturan validasi input (`FormRequest`) dari controller. Memastikan input client divalidasi dan disanitasi sebelum menyentuh logika aplikasi.
3. **Controller Layer (`app/Http/Controllers/`):** Bertindak murni sebagai *HTTP orchestrator*. Mengonsumsi *validated request*, memanggil service layer, dan memformat respon JSON seragam melalui trait `ApiResponser`. Controller dilarang memuat query Eloquent yang kompleks.
4. **Service Layer (`app/Services/`):** Jantung logika bisnis aplikasi (*business domain*). Menangani transaksi database (`DB::transaction()`), *concurrency lock* (`lockForUpdate()`), integrasi payment gateway Midtrans, otomasi kredensial Mosquitto MQTT, dan komunikasi real-time IoT.
5. **Data Access & Model Layer (`app/Models/`):** Menggunakan Eloquent ORM dengan primary key bertipe UUID v4 (`GenerateUuid`). Model memuat relasi antar tabel, type casting, dan *domain helper methods* (seperti penghitungan sisa hari langganan).
6. **Hardware & Event-Driven IoT Layer (`app/Console/Commands/`, MQTT):** Menghubungkan dunia mikrokontroler (ESP32) dengan backend melalui broker MQTT Mosquitto, daemon listener `php artisan mqtt:listen`, dan scheduler peringatan masa langganan `php artisan langganan:cek-h3`.

### B. Multi-Tenancy & Data Isolation Model
- **Tenant Context:** Seluruh data operasional kebun (`kebuns`, `bloks`, `node_sensors`, `gateways`, `siklus_panens`) terikat langsung atau tidak langsung ke entitas `Tenant`.
- **Tenant Isolation Enforcement:** Petani hanya diizinkan mengakses data yang memiliki kecocokan `tenant_id` dengan akun login.
- **Privacy & SuperAdmin Consent Protocol:** Super Admin tidak memiliki akses *wildcard* instan ke data kebun tenant. Agar Super Admin dapat melihat detail kebun tenant (`KebunPolicy`), Super Admin wajib mengajukan izin akses (`AksesTenantAdmin`) dan harus disetujui secara eksplisit oleh pemilik tenant (`AksesTenantService::bolehAkses()`).

### C. Folder Structure Tree

```
apps/web/backend-sensor/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── CekLanggananAkanHabis.php   # Scheduler notifikasi H-3 langganan
│   │       └── MqttListen.php              # Daemon loop MQTT subscriber (telemetri & energi)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php      # Login, Register, Logout Sanctum
│   │   │   ├── WebhookMidtransController.php # Callback Webhook Payment Gateway
│   │   │   ├── admin/                      # Controller khusus Super Admin
│   │   │   │   ├── AksesTenantAdminController.php
│   │   │   │   ├── DashboardAdminController.php
│   │   │   │   ├── LanggananAdminController.php
│   │   │   │   ├── LogAktivitasController.php
│   │   │   │   ├── PaketLanggananAdminController.php
│   │   │   │   ├── TenantAdminController.php
│   │   │   │   └── UserAdminController.php
│   │   │   └── petani/                     # Controller operasional Petani
│   │   │       ├── AksesTenantController.php
│   │   │       ├── AutoDimmingController.php
│   │   │       ├── BlokController.php
│   │   │       ├── BlokStatusController.php
│   │   │       ├── GatewayController.php
│   │   │       ├── JadwalLampuController.php
│   │   │       ├── KebunController.php
│   │   │       ├── KodeQrController.php
│   │   │       ├── LanggananController.php
│   │   │       ├── LogEnergyController.php
│   │   │       ├── NodeController.php
│   │   │       ├── NotifikasiController.php
│   │   │       ├── SiklusPanenController.php
│   │   │       └── TelemetriController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureIsSuperAdmin.php      # Guard role superAdmin
│   │   │   ├── EnsureLanggananAktif.php    # Guard masa aktif langganan & grace period
│   │   │   └── EnsureTenantAktif.php       # Guard tenant tidak di-suspend
│   │   └── Requests/                       # Kumpulan FormRequest validator
│   │       ├── Auth/
│   │       ├── blok/
│   │       ├── gateway/
│   │       ├── jadwalLampu/
│   │       ├── kebun/
│   │       ├── langganan/
│   │       ├── node/
│   │       ├── paketLangganan/
│   │       ├── qr/
│   │       ├── siklusPanen/
│   │       └── userAdmin/
│   ├── Models/                             # 19 Eloquent Models dengan UUID PK
│   ├── Policies/
│   │   └── KebunPolicy.php                 # Authorization Gate view/update/delete kebun
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   ├── Services/                           # Business logic terkelompok
│   │   ├── AuthService.php
│   │   ├── management_admin/               # Service domain Super Admin
│   │   ├── management_kebun/               # Service domain IoT, kebun, jadwal, auto-dimming
│   │   ├── management_langganan/           # Service domain billing & trial
│   │   ├── management_notifikasi/          # Service domain notifikasi tenant
│   │   └── management_pembayaran/          # Service integrasi Midtrans Snap & Signature
│   └── Traits/
│       ├── ApiResponser.php                # Standarisasi JSON Response & pagination meta
│       ├── FileUploadTrait.php             # Handler upload foto publik & privat
│       ├── GenerateUuid.php                # Auto UUID boot & disable auto-increment
│       └── concern/
│           └── HandlesTenantAccess.php     # Reusable authorization check tenant/superAdmin
├── bootstrap/
│   └── app.php                             # Inisialisasi rute, alias middleware, exception handling
├── config/
│   ├── cors.php                            # Konfigurasi Cross-Origin Resource Sharing
│   ├── lampu.php                           # Konfigurasi offline sensor threshold & timezone
│   ├── langganan.php                       # Durasi trial & masa tenggang hari
│   └── services.php                        # Kredensial pihak ketiga (Midtrans)
├── database/
│   └── migrations/                         # 29 Berkas migrasi database
├── routes/
│   ├── api.php                             # Auth & Webhook routes
│   ├── api/
│   │   ├── admin.php                       # Super Admin API routes
│   │   ├── iot.php                         # Direct IoT telemetry HTTP mock
│   │   └── petani.php                      # Petani operational API routes
│   └── console.php
└── tests/
    └── Feature/                            # Pest Feature tests suite
```

### D. Environment Variables Checklist
Daftar variabel lingkungan penting yang wajib dikonfigurasi pada file `.env`:

| Variable Key | Tipe Data | Default / Contoh | Dampak Operasional & Fungsi |
|---|---|---|---|
| `APP_URL` | String | `http://localhost:8000` | Root URL aplikasi untuk resolve storage asset |
| `DB_CONNECTION` | String | `pgsql` | Driver database (menggunakan PostgreSQL) |
| `DB_HOST` | String | `127.0.0.1` | Host server database |
| `DB_PORT` | Integer | `5432` / `5433` | Port PostgreSQL |
| `DB_DATABASE` | String | `sensor` | Nama database |
| `DB_USERNAME` | String | `postgres` | User database |
| `DB_PASSWORD` | String | `secret` | Kata sandi database |
| `MQTT_HOST` | String | `127.0.0.1` | Host MQTT broker (Mosquitto) |
| `MQTT_PORT` | Integer | `1883` | Port MQTT broker non-TLS |
| `MQTT_BACKEND_USERNAME` | String | `agrolight-backend` | Akun listener & publisher backend di Mosquitto |
| `MQTT_BACKEND_PASSWORD` | String | `secret` | Password akun backend di Mosquitto |
| `MOSQUITTO_PASSWD_BIN` | Path | `D:/Mosquitto/mosquitto_passwd.exe` | Lokasi binary CLI mosquitto_passwd untuk pairing dinamis |
| `MOSQUITTO_PASSWD_FILE` | Path | `D:/Mosquitto/config/passwd` | Lokasi file password Mosquitto |
| `MOSQUITTO_ACL_FILE` | Path | `D:/Mosquitto/config/acl` | Lokasi file ACL Mosquitto untuk isolasi topik gateway |
| `MIDTRANS_SERVER_KEY` | String | `Mid-server-xxx` | Server Key Midtrans untuk verifikasi signature & API |
| `MIDTRANS_CLIENT_KEY` | String | `Mid-client-xxx` | Client Key Midtrans untuk frontend Snap SDK |
| `MIDTRANS_IS_PRODUCTION`| Boolean | `false` | Mode sandbox (`false`) atau production (`true`) |
| `LANGGANAN_TRIAL_HARI` | Integer | `7` | Durasi hari paket uji coba gratis bagi tenant baru |
| `LANGGANAN_MASA_TENGGANG_HARI` | Integer | `2` | Jumlah hari toleransi setelah paket habis sebelum terkunci |
| `LAMPU_OFFLINE_SETELAH_DETIK` | Integer | `20` | Ambang detik tidak adanya heartbeat sebelum sensor dianggap offline |
| `LAMPU_TIMEZONE` | String | `Asia/Jakarta` | Zona waktu evaluasi jadwal nyala lampu |
| `FRONTEND_URL` | String | `http://localhost:5173,http://localhost:3000` | Asal origin yang diizinkan CORS |

---

## 2. File-by-File Breakdown

Berikut adalah audit teknis menyeluruh per-file yang ada pada backend codebase AgroLight:

---

### KATEGORI 1: BOOTSTRAP & ROUTING

#### File: `bootstrap/app.php`
- **Fungsi Utama:** Titik masuk konfigurasi runtime aplikasi Laravel 11. Mengatur rute API berlapis, alias middleware kustom, dan standardisasi JSON exception rendering.
- **Method / Logic Kunci:**
  - `then()`: Mendefinisikan 3 grup rute API terpisah:
    - `api/admin` -> diarahkan ke `routes/api/admin.php` dengan middleware `['api', 'auth:sanctum']`.
    - `api/petani` -> diarahkan ke `routes/api/petani.php` dengan middleware `['api', 'auth:sanctum']`.
    - `api/iot` -> diarahkan ke `routes/api/iot.php` dengan middleware `api`.
  - `withMiddleware()`: Mendaftarkan alias `superAdmin` yang merujuk ke `EnsureIsSuperAdmin::class`.
  - `withExceptions()`: Memaksa rendering response JSON untuk semua request yang berawalan `api/*` atau meminta `expectsJson()`.
- **Ketergantungan:**
  - *Menggunakan:* `Illuminate\Foundation\Application`, `App\Http\Middleware\EnsureIsSuperAdmin`.
  - *Dipanggil Oleh:* `public/index.php` dan Artisan CLI.
- **Catatan Khusus:**
  - Seluruh sub-rute di bawah `api/admin` dan `api/petani` sudah otomatis terproteksi `auth:sanctum` dari level `bootstrap/app.php`.

#### File: `routes/api.php`
- **Fungsi Utama:** Mendefinisikan endpoint tingkat akar (root API) meliputi autentikasi publik, logout, dan webhook Midtrans.
- **Ketergantungan:** `AuthController`, `WebhookMidtransController`.
- **Catatan Khusus:** Rute login menerapkan `throttle:5,1` untuk mencegah serangan *brute-force*.

#### File: `routes/api/admin.php`
- **Fungsi Utama:** Mendefinisikan seluruh rute administratif Super Admin (`/api/admin/*`) yang dibungkus oleh middleware `superAdmin`.
- **Ketergantungan:** Seluruh controller di namespace `App\Http\Controllers\admin` serta resource controller petani (`KebunController`, `BlokController`, dll.) untuk akses investigasi.

#### File: `routes/api/petani.php`
- **Fungsi Utama:** Mendefinisikan seluruh rute operasional petani (`/api/petani/*`) yang dibagi menjadi dua zona proteksi: zona bebas langganan (manajemen billing, permohonan akses, pairing gateway) dan zona terproteksi langganan aktif (`EnsureLanggananAktif`).
- **Ketergantungan:** Seluruh controller di namespace `App\Http\Controllers\petani`.

#### File: `routes/api/iot.php`
- **Fungsi Utama:** Endpoint penerimaan data sensor alternatif berbasis HTTP (`/api/iot/telemetri/terima-sensor`). Digunakan untuk pengujian direct POST tanpa broker MQTT.

---

### KATEGORI 2: MIDDLEWARE & POLICIES

#### File: `app/Http/Middleware/EnsureIsSuperAdmin.php`
- **Fungsi Utama:** Memastikan pengguna yang sedang login memiliki atribut `role === 'superAdmin'`.
- **Method Kunci:**
  - `handle(Request $request, Closure $next)`: Memeriksa role user. Jika tidak sesuai, me-return JSON 403 (`status: 'error'`, pesan: *"Akses ditolak. Endpoint ini hanya untuk Super Admin."*).
- **Ketergantungan:** `App\Models\User`.
- **Dipanggil Oleh:** Rute-rute di `routes/api/admin.php`.

#### File: `app/Http/Middleware/EnsureTenantAktif.php`
- **Fungsi Utama:** Memvalidasi bahwa akun petani terhubung ke tenant dan status tenant tersebut sedang aktif (`is_aktif === true`).
- **Method Kunci:**
  - `handle()`: Mengambil `user->tenant_id`. Jika tenant bernilai null atau `is_aktif === false`, request dihentikan dengan status 403.
- **Ketergantungan:** `App\Models\Tenant`.
- **Dipanggil Oleh:** Grup rute langganan, notifikasi, dan operasional kebun di `routes/api/petani.php`.

#### File: `app/Http/Middleware/EnsureLanggananAktif.php`
- **Fungsi Utama:** Gerbang lisensi fitur aplikasi. Memeriksa apakah tenant memiliki paket aktif atau masih dalam masa tenggang (*grace period*).
- **Method Kunci:**
  - `handle()`: Mengambil status efektif tenant melalui `LanggananService::getStatus($tenantId)->statusEfektif()`. Jika berstatus `'kadaluarsa'`, me-return HTTP 402 (*Payment Required*).
- **Ketergantungan:** `App\Services\management_langganan\LanggananService`.
- **Catatan Khusus:** Jika status adalah `'tenggang'`, request tetap diizinkan lewat agar operasional kebun tidak langsung terputus tiba-tiba di lapangan.

#### File: `app/Policies/KebunPolicy.php`
- **Fungsi Utama:** Otorisasi akses detail model `Kebun` (`view`, `update`, `delete`).
- **Method Kunci:**
  - `view()`, `update()`, `delete()`: Menggunakan trait `HandlesTenantAccess` untuk memastikan petani hanya mengakses kebun tenantnya sendiri, atau Super Admin yang sudah memperoleh persetujuan akses aktif dari tenant tersebut.
- **Ketergantungan:** `App\Models\Kebun`, `App\Models\User`, `App\Traits\concern\HandlesTenantAccess`.

---

### KATEGORI 3: TRAITS & CROSS-CUTTING CONCERNS

#### File: `app/Traits/ApiResponser.php`
- **Fungsi Utama:** Standarisasi struktur payload respon JSON ke client.
- **Method Kunci:**
  - `successResponse($data, $message = null, $code = 200)`: Menghasilkan envelope `{ status: "succes", pesan: message, data: data }`.
  - `errorResponse($message, $code)`: Menghasilkan envelope `{ status: "error", pesan: message }`.
  - `paginationMeta($paginator)`: Mengekstrak metadata paginasi Laravel (`current_page`, `per_page`, `total`, `last_page`).
- **Dipanggil Oleh:** Hampir seluruh Controller di backend.

#### File: `app/Traits/FileUploadTrait.php`
- **Fungsi Utama:** Abstraksi penanganan berkas gambar (foto kebun, foto blok, bukti transfer) dengan struktur direktori dinamis berbasis waktu (`YYYY/MM`).
- **Method Kunci:**
  - `uploadFoto($file, string $baseFolder, ?string $oldPath = null)`: Menyimpan gambar ke disk `public` dan otomatis menghapus berkas lama jika ada file pengganti.
  - `uploadPrivat($file, string $baseFolder, ?string $oldPath = null)`: Menyimpan berkas sensitif (bukti transfer) ke disk `local` privat agar tidak bisa diakses langsung via URL browser.
  - `hapusFoto(?string $path)` & `hapusFilePrivat(?string $path)`: Menghapus file fisik dari storage.
  - `aturanValidasiFoto(bool $wajib = false)`: Menghasilkan string rule validasi standar: `"required/nullable|image|mimes:jpeg,png,jpg,webp|max:2048"`.

#### File: `app/Traits/GenerateUuid.php`
- **Fungsi Utama:** Otomatisasi pengisian primary key model menggunakan UUID v4 saat event Eloquent `creating` dipicu, serta menonaktifkan sifat auto-incrementing.
- **Dipanggil Oleh:** Seluruh model yang menggunakan string UUID sebagai ID.

#### File: `app/Traits/concern/HandlesTenantAccess.php`
- **Fungsi Utama:** Logika bersama untuk memverifikasi hak akses user terhadap resource suatu tenant.
- **Method Kunci:**
  - `canAccessTenant(User $user, ?string $targetTenantId): bool`: Mengembalikan `true` jika user adalah pemilik tenant, atau jika user adalah Super Admin yang memiliki izin aktif di `AksesTenantService`.

---

### KATEGORI 4: AUTHENTICATION MODULE

#### File: `app/Http/Controllers/Auth/AuthController.php`
- **Fungsi Utama:** Menangani endpoint HTTP registrasi, login, dan logout.
- **Method Kunci:**
  - `register(RegisterRequest $request)`: Mendaftarkan tenant dan user baru, menerbitkan token Sanctum, respon HTTP 201.
  - `login(LoginRequest $request)`: Validasi kredensial, cek keaktifan akun user, hapus token lama, terbitkan token baru.
  - `logout(Request $request)`: Menghapus personal access token user yang sedang aktif.
- **Ketergantungan:** `AuthService`, `ApiResponser`, `RegisterRequest`, `LoginRequest`.

#### File: `app/Services/AuthService.php`
- **Fungsi Utama:** Logika bisnis pembuatan tenant, registrasi user, dan penerbitan token.
- **Method Kunci:**
  - `registerUser(array $data)`: Membungkus pembuatan entitas `Tenant` dan `User` ke dalam transaksi database (`DB::transaction()`). Tenant baru otomatis mendapatkan paket awal `gratis` dan user mendapatkan role `petani_biasa`.
  - `checkCredential($email, $password)`: Memverifikasi keberadaan user dan kecocokan hash Bcrypt password.
  - `createNewToken(User $user)`: Menghapus seluruh token lama (`$user->tokens()->delete()`) untuk mencegah multiple active sessions, lalu menerbitkan token Sanctum baru dengan nama `'auth_token'`.

---

### KATEGORI 5: SUPER ADMIN MODULE

#### File: `app/Http/Controllers/admin/DashboardAdminController.php`
- **Fungsi Utama:** Menyediakan endpoint agregat statistik dashboard Super Admin (`/api/admin/dashboard/ringkasan`).
- **Ketergantungan:** `DashboardAdminService`.

#### File: `app/Services/management_admin/DashboardAdminService.php`
- **Fungsi Utama:** Menghitung seluruh metrik performa platform AgroLight.
- **Method Kunci:**
  - `getRingkasan()`: Menghimpun 6 sub-ringkasan:
    - `ringkasanTenant()`: Total, aktif, nonaktif.
    - `ringkasanUser()`: Total, aktif, nonaktif, dan rincian per-role.
    - `ringkasanLangganan()`: Menggunakan `chunk(200)` untuk mengevaluasi `statusEfektif()` (aktif, tenggang, kadaluarsa) tanpa kehabisan memori server.
    - `ringkasanTransaksi()`: Total, menunggu pembayaran, diverifikasi, ditolak, dan total pendapatan rupiah.
    - `ringkasanInfrastruktur()`: Status kebun, total blok, kesehatan status gateway, dan persebaran jenis node sensor.
    - `aktivitasTerbaru(int $limit = 10)`: Menampilkan 10 riwayat audit trail log admin terbaru.
- **Ketergantungan:** Seluruh model operasional sistem.

#### File: `app/Http/Controllers/admin/TenantAdminController.php` & `TenantAdminService.php`
- **Fungsi Utama:** Manajemen siklus hidup tenant (daftar tenant, detail kebun & user terhubung, pembekuan/pengaktifan kembali akun tenant).
- **Method Kunci:**
  - `getSemuaTenant(int $perPage)`: Mengambil daftar paginasi tenant beserta ringkasan status efektif langganan dan jumlah kebun.
  - `nonaktifkanTenant()` & `aktifkanTenant()`: Memperbarui kolom `is_aktif` pada tenant dan mencatat tindakan ke `LogAktivitasService`.

#### File: `app/Http/Controllers/admin/AksesTenantAdminController.php`
- **Fungsi Utama:** Mengizinkan Super Admin mengajukan permohonan akses data kebun kepada pemilik tenant (`ajukan`) dan melihat riwayat permohonan yang pernah diajukan (`riwayatSaya`).

#### File: `app/Services/management_admin/AksesTenantService.php`
- **Fungsi Utama:** Mengelola alur persetujuan (*consent management*) privasi data tenant.
- **Method Kunci:**
  - `bolehAkses(string $tenantId, string $adminId): bool`: Memeriksa apakah terdapat izin berstatus `'disetujui'`.
  - `ajukan(string $tenantId, string $adminId, ?string $alasan)`: Mencegah duplikasi permohonan jika sudah ada yang berstatus `pending` atau `disetujui`.
  - `setujui(string $id, User $petani)`: Menjalankan `DB::transaction()` dan `lockForUpdate()`. Memastikan petani hanya menyetujui izin untuk tenant miliknya sendiri dan statusnya masih `pending`.
  - `tolak(string $id, User $petani, ?string $alasan)`: Menolak permohonan Super Admin dengan catatan alasan penolakan.
  - `cabut(string $id, User $petani)`: Mencabut hak akses Super Admin yang sebelumnya telah diberikan.

#### File: `app/Http/Controllers/admin/UserAdminController.php` & `UserAdminService.php`
- **Fungsi Utama:** Manajemen data user oleh Super Admin.
- **Method Kunci:**
  - `buatUser()`: Mendaftarkan user baru dengan role `petani_biasa` (wajib ada `tenant_id`) atau `superAdmin` (dilarang ada `tenant_id`).
  - `nonaktifkanUser()`: Mencegah admin menonaktifkan akunnya sendiri (HTTP 422), mematikan flag `is_aktif`, dan langsung menghapus seluruh personal access token yang sedang aktif.

#### File: `app/Http/Controllers/admin/PaketLanggananAdminController.php` & `PaketLanggananAdminService.php`
- **Fungsi Utama:** Pengelolaan master paket langganan (CRUD, aktifkan/nonaktifkan paket).
- **Catatan Bisnis Kunci:**
  - `hapusPaket()`: Memeriksa apakah paket pernah digunakan pada transaksi sebelumnya di `transaksi_langganans`. Jika pernah, operasi DELETE dibatalkan dan dilemparkan `DomainException` (HTTP 409) dengan instruksi agar paket dinonaktifkan saja, bukan dihapus, demi menjaga integritas data riwayat keuangan.

#### File: `app/Http/Controllers/admin/LanggananAdminController.php`
- **Fungsi Utama:** Mengelola verifikasi manual pembayaran transfer bank dari petani.
- **Method Kunci:**
  - `index()`: Filter transaksi berdasarkan status (`menunggu_verifikasi`, `berhasil`, `ditolak`).
  - `verifikasi()`: Memverifikasi transaksi dan memperpanjang masa aktif tenant.
  - `tolak()`: Menolak transaksi dengan input alasan yang wajib diisi.
  - `buktiTransfer()`: Membaca file gambar bukti transfer dari disk privat (`local`) dan mengalirkannya ke respon biner dengan header `Content-Type` yang sesuai.

#### File: `app/Http/Controllers/admin/LogAktivitasController.php` & `LogAktivitasService.php`
- **Fungsi Utama:** Pencatatan dan penayangan audit trail seluruh aksi sensitif yang dilakukan oleh Super Admin.

---

### KATEGORI 6: SUBSCRIPTION & BILLING MODULE

#### File: `app/Http/Controllers/petani/LanggananController.php`
- **Fungsi Utama:** Antarmuka billing sisi petani (melihat katalog paket, cek status sisa hari, riwayat transaksi, upload bukti transfer, atau inisiasi Midtrans online).
- **Ketergantungan:** `LanggananService`, `AjukanPembelianLanggananRequest`.

#### File: `app/Services/management_langganan/LanggananService.php`
- **Fungsi Utama:** Mesin utama perhitungan siklus langganan, masa uji coba (trial), dan verifikasi transaksi.
- **Method Kunci:**
  - `getStatus(string $tenantId)`: Mengambil data `LanggananTenant`. Jika tenant baru pertama kali mengakses, otomatis diinisialisasi status `'trial'` dengan sisa hari dari konfigurasi (default 7 hari).
  - `ajukanPembelian(string $tenantId, string $paketId, UploadedFile $buktiTransfer)`: Menyimpan bukti transfer ke disk privat dan membuat row transaksi berstatus `menunggu_verifikasi`.
  - `verifikasiPembelian(string $idTransaksi, string $adminId)`:
    - Menggunakan `DB::transaction()` dan `lockForUpdate()` pada row transaksi dan langganan untuk mencegah *race condition* (double verification).
    - Memanggil `cariAtauBuatLanggananTanpaTrial()`. Sengaja tidak memberikan trial baru jika baris belum ada.
    - Menghitung sisa hari baru: `sisa_hari_baru = sisaHariAktual() + tambahan_hari`.
    - Memperbarui status transaksi menjadi `berhasil` dan memperbarui field snapshot `paket_langganan` pada tenant.
  - `ajukanPembelianOnline(string $tenantId, string $paketId)`: Menerbitkan transaksi `menunggu_pembayaran` dan memanggil `MidtransService::buatSnapToken()`.
  - `verifikasiOtomatisViaGateway(string $idTransaksi, string $referensiGateway)`: Dipanggil oleh webhook Midtrans saat pembayaran online lunas.

#### File: `app/Http/Controllers/WebhookMidtransController.php`
- **Fungsi Utama:** Penerima webhook notifikasi event pembayaran dari server Midtrans.
- **Method Kunci:**
  - `handle(Request $request)`:
    - Memvalidasi signature SHA-512 via `MidtransService::verifikasiSignature()`. Jika tidak valid, mengembalikan HTTP 403.
    - Jika status transaksi adalah `'capture'` / `'settlement'` dan `fraud_status !== 'deny'`, memanggil `verifikasiOtomatisViaGateway()`.
    - Jika status transaksi adalah `'deny'`, `'cancel'`, atau `'expire'`, memanggil `tolakOtomatisViaGateway()`.

#### File: `app/Services/management_pembayaran/MidtransService.php`
- **Fungsi Utama:** Driver SDK Midtrans Snap.
- **Method Kunci:**
  - `buatSnapToken()`: Mengonfigurasi parameter transaksi Snap (gross amount, item detail, customer tenant).
  - `verifikasiSignature()`: Menghitung hash SHA-512 dari `orderId + statusCode + grossAmount + serverKey` dan membandingkannya menggunakan `hash_equals()` untuk mencegah timing attacks.

---

### KATEGORI 7: FARM, SENSOR & HARDWARE MODULE

#### File: `app/Http/Controllers/petani/KebunController.php` & `KebunService.php`
- **Fungsi Utama:** Operasi CRUD kebun, manajemen foto kebun publik, dan integrasi otorisasi multi-tenant serta consent superAdmin.

#### File: `app/Http/Controllers/petani/BlokController.php` & `BlokService.php`
- **Fungsi Utama:** Operasi CRUD blok perkebunan. Seluruh blok wajib merujuk ke `kebun_id`. Mendukung upload dan pergantian foto blok.

#### File: `app/Http/Controllers/petani/BlokStatusController.php` & `BlokStatusService.php`
- **Fungsi Utama:** Evaluasi kesehatan koneksi node sensor lampu dalam satu blok.
- **Method Kunci:**
  - `getRingkasanBlok(string $blokId)`: Membandingkan timestamp `terakhir_terlihat` pada tiap node sensor dengan batas ambang (`Carbon::now()->subSeconds(offline_setelah_detik)`). Mengembalikan ringkasan jumlah lampu total, online, dan offline.

#### File: `app/Http/Controllers/petani/NodeController.php` & `NodeService.php`
- **Fungsi Utama:** Registrasi dan manajemen node sensor mikrokontroler di tiang kebun.
- **Method Kunci:**
  - `createNode()`: Membungkus pendaftaran sensor. Jika `qr_id` tidak disertakan di payload, otomatis membuat row `KodeQr` baru dengan format kode `"QR-NODE-XXXXXX"`.
  - `getNodeById()`: Mendukung pencarian fleksibel berdasarkan UUID, teks kode QR, atau kode perangkat serial.
  - `generateNewQrForSensor()`: Menghasilkan kode QR baru, menghapus QR lama, dan memperbarui asosiasi relasi sensor.

#### File: `app/Http/Controllers/petani/GatewayController.php` & `GatewayService.php`
- **Fungsi Utama:** Pendaftaran gateway LoRa/WiFi dan penghasilan kode pairing otomatis (`PAIR-XXXXXX`).

#### File: `app/Services/management_kebun/GatewayPairingService.php`
- **Fungsi Utama:** Menangani penukaran kredensial ESP32 saat pertama kali dipasangkan di lapangan melalui Captive Portal.
- **Method Kunci:**
  - `pair(string $kodePerangkat, string $kodePairing)`:
    - Memvalidasi bahwa kode perangkat terdaftar dan kode pairing cocok.
    - Menerbitkan token acak 60 karakter (`Str::random(60)`).
    - Menghanguskan kode pairing (`kode_pairing = null`), menandai status koneksi `terhubung`, dan mencatat `terakhir_terlihat = now()`.
    - Memanggil `daftarkanKredensialMqtt()`.
  - `daftarkanKredensialMqtt(string $kodePerangkat, string $token)`:
    - Menjalankan eksekusi binary `mosquitto_passwd` via CLI (`exec()`) untuk mendaftarkan akun gateway ke file password broker Mosquitto.
    - Menuliskan aturan Access Control List (ACL) ke file `mosquitto.acl` agar gateway tersebut hanya memiliki hak publish/subscribe pada topiknya sendiri:
      `user {kodePerangkat}`
      `topic readwrite agrolight/{kodePerangkat}/#`

#### File: `app/Http/Controllers/petani/KodeQrController.php`, `KodeQrService.php`, & `QrScanService.php`
- **Fungsi Utama:** Manajemen inventori stiker QR fisik dan pemindaian di aplikasi mobile.
- **Method Kunci:**
  - `scan(string $teksKodeQr, array $meta)`:
    - Mencari kode QR dan memastikan statusnya aktif.
    - Menemukan relasi node sensor, blok, dan kebun.
    - Memverifikasi isolasi tenant: jika tenant user berbeda dengan tenant pemilik kebun, akses ditolak dan dicatat audit log dengan status `'ditolak_beda_tenant'`.
    - Mencatat seluruh percobaan scan (sukses maupun gagal) ke tabel `qr_scan_logs` lengkap dengan koordinat GPS (latitude, longitude), IP address, dan platform perangkat.

---

### KATEGORI 8: LIGHTING AUTOMATION & IOT TELEMETRY

#### File: `app/Http/Controllers/petani/JadwalLampuController.php` & `JadwalLampuService.php`
- **Fungsi Utama:** Otomasi penjadwalan penyinaran lampu fotoperiode buah naga untuk merangsang pembungaan di luar musim.
- **Method Kunci:**
  - `createJadwal()`: Mendukung penjadwalan di tingkat kebun (default semua lampu kebun) atau override di tingkat node sensor individual. Menonaktifkan jadwal aktif sebelumnya dalam cakupan yang sama, lalu memicu sinkronisasi MQTT ke perangkat terdampak.
  - `updateJadwal()`: Memperbarui jadwal. Dilengkapi proteksi anti-flicker: jika user mengubah slider `instensitas_cahaya` pada mode manual terlalu cepat, sistem menahan dengan `RateLimiter` cooldown (default 7 detik).
  - `resolveJadwalAktifUntukSensor(string $sensorId)`: Menyelesaikan jadwal efektif dengan hierarki: periksa override node terlebih dahulu; jika tidak ada, gunakan jadwal default kebun.
  - `sedangDalamJendelaNyala(JadwalLampu $jadwal)`: Mengevaluasi apakah waktu saat ini berada di dalam rentang jam nyala lampu, termasuk jadwal lintas tengah malam (contoh: 18:00 s/d 05:00).
  - `publishUntukSensorTerdampak()`: Memicu `MqttPublisherService` untuk mengirimkan payload jadwal terbaru ke broker.

#### File: `app/Services/management_kebun/AutoDimmingService.php`
- **Fungsi Utama:** Algoritma peredupan lampu adaptif berbasis intensitas cahaya alami lingkungan (bulan purnama / cuaca malam).
- **Method Kunci:**
  - `hitungDanCatat(string $sensorId, float $nilaiLux, ?string $faseBulan)`:
    - Memastikan jadwal aktif berada pada mode `'auto'` dan saat ini berada dalam jendela jam nyala.
    - Menghitung persentase redup:
      $$\text{mentah} = \left(\frac{\text{target\_lux} - \text{nilai\_lux}}{\text{target\_lux}}\right) \times 100$$
      $$\text{persentase} = \max(\text{intensitas\_minimum}, \min(100, \text{mentah}))$$
    - Menyimpan log perhitungan ke tabel `log_peredupans`.
    - Menerbitkan perintah intensitas redup ke topik MQTT gateway node bersangkutan via `MqttPublisherService::publishDimming()`.

#### File: `app/Services/management_kebun/MqttPublisherService.php`
- **Fungsi Utama:** Klien publisher MQTT sekali pakai (*transient connection*) yang dipanggil dari request HTTP.
- **Method Kunci:**
  - `publishJadwal()`: Mengirimkan instruksi jadwal ke topik `agrolight/{kodePerangkat}/{sensorId}/jadwal`.
  - `publishDimming()`: Mengirimkan instruksi peredupan ke topik `agrolight/{kodePerangkat}/{sensorId}/dimming`.
  - `publish()`: Menginisiasi koneksi TCP ke Mosquitto, melakukan publish dengan QoS 1 dan Retain true, lalu langsung memutuskan koneksi (`disconnect()`). Dilengkapi blok try-catch agar jika broker MQTT sedang down, request HTTP utama petani tidak ikut gagal/crash.

#### File: `app/Console/Commands/MqttListen.php`
- **Fungsi Utama:** Daemon CLI proses panjang (`php artisan mqtt:listen`) yang menjalankan loop koneksi persisten ke broker Mosquitto.
- **Topik Langganan (Subscription):**
  - `agrolight/+/telemetri`: Menerima data pembacaan lux, suhu, dan fase bulan. Meneruskannya ke `TelemetriProcessorService::prosesTelemetri()`.
  - `agrolight/+/energi`: Menerima data konsumsi daya (Watt). Meneruskannya ke `TelemetriProcessorService::prosesEnergi()`.

#### File: `app/Services/management_kebun/TelemetriProcessorService.php`
- **Fungsi Utama:** Memproses dan memvalidasi payload pesan MQTT yang diterima oleh command `mqtt:listen`.
- **Method Kunci:**
  - `cariSensorMilikGateway(string $topic, mixed $sensorId)`: Memvalidasi bahwa sensor ID yang dikirim oleh gateway di payload benar-benar terdaftar di database sebagai anak dari gateway tersebut (mencegah *device spoofing*).
  - `prosesTelemetri()`: Menyimpan rekaman ke tabel `read__sensors`, kemudian memicu kalkulasi auto-dimming jika pembacaan lux valid.
  - `prosesEnergi()`: Menyimpan rekaman daya ke tabel `log_energies`.

#### File: `app/Services/management_kebun/LogEnergyService.php`
- **Fungsi Utama:** Perhitungan estimasi konsumsi energi listrik kumulatif (Kilowatt-Hour / kWh).
- **Method Kunci:**
  - `getTotalKwhBySensor(string $sensorId)`: Mengintegrasikan deretan titik pembacaan watt terhadap rentang waktu antar pembacaan:
    $$\text{kWh} = \sum \left(\frac{\text{watt} \times \text{detik}}{3600}\right) \div 1000$$
    Terdapat konstanta `MAKS_CELAH_MENIT = 15`: jika jeda antar data melebihi 15 menit, diasumsikan perangkat sempat mati/offline sehingga celah waktu kosong tersebut tidak dihitung konsumsi listriknya secara penuh.

#### File: `app/Http/Controllers/petani/SiklusPanenController.php` & `SiklusPanenService.php`
- **Fungsi Utama:** Manajemen siklus pembungaan dan panen buah naga.
- **Method Kunci:**
  - `createSiklus()`: Menghitung estimasi awal tanggal panen:
    $$\text{estimasi} = \text{tanggal\_penyinaran} + \text{target\_hari\_berbunga} + \text{target\_hari\_panen\_setelah\_bunga (50 hari)}$$
  - `updateSiklus()`: Begitu `tanggal_berbunga_aktual` tercatat, estimasi tanggal panen dikalkulasi ulang secara presisi dari tanggal bunga nyata tersebut. Jika `tanggal_panen` diisi, status siklus otomatis berganti menjadi `'SELESAI'`.

#### File: `app/Console/Commands/CekLanggananAkanHabis.php`
- **Fungsi Utama:** Scheduled cron job harian (`php artisan langganan:cek-h3`) untuk memindai tenant yang sisa hari langganannya tinggal 1 sampai 3 hari lagi. Otomatis membuat baris `Notifikasi` tipe `'langganan_akan_habis'` agar petani segera melakukan perpanjangan paket.

---

### KATEGORI 9: ELOQUENT MODELS CATALOG

| Nama Model | Nama Tabel DB | Primary Key | Traits Kunci | Tanggung Jawab & Relasi |
|---|---|---|---|---|
| `User` | `users` | `id` (UUID) | `HasApiTokens`, `GenerateUuid`, `HasFactory` | Akun pengguna (`role`: `superAdmin`, `petani_biasa`). Terikat ke `Tenant`. |
| `Tenant` | `tenants` | `tenant_id` (UUID) | `GenerateUuid`, `HasFactory` | Entitas bisnis/perkebunan. Memiliki banyak `User` dan `Kebun`. |
| `AksesTenantAdmin` | `akses_tenant_admins` | `id` (UUID) | `GenerateUuid` | Tabel persetujuan privasi akses data tenant oleh Super Admin. |
| `Kebun` | `kebuns` | `id_kebun` (UUID) | `GenerateUuid`, `HasFactory` | Perkebunan buah naga. Milik 1 `Tenant`, memiliki banyak `Blok`. |
| `Blok` | `bloks` | `id_blok` (UUID) | `GenerateUuid`, `HasFactory` | Area petak di dalam kebun. Memiliki 1 `NodeSensor` dan banyak `SiklusPanen`. |
| `NodeSensor` | `node_sensors` | `id_sensor` (UUID) | `GenerateUuid`, `HasFactory` | Tiang lampu/sensor fisik. Terhubung ke 1 `Gateway`, 1 `Blok`, dan 1 `KodeQr`. |
| `Gateway` | `gateways` | `id_gateway` (UUID) | `GenerateUuid`, `HasFactory` | Perangkat jembatan transmisi LoRa/WiFi ESP32. Menyimpan hash `token_gateway`. |
| `KodeQr` | `kode_qrs` | `id_qr` (UUID) | `GenerateUuid`, `HasFactory` | Kode QR alfanumerik stiker fisik. Berelasi dengan 1 `NodeSensor` dan `QrScanLog`. |
| `QrScanLog` | `qr_scan_logs` | `id_scan_log` (UUID) | `GenerateUuid`, `HasFactory` | Riwayat audit scan kamera (user, koordinat GPS, status scan). |
| `JadwalLampu` | `jadwal_lampus` | `id_jadwal_lampu` (UUID) | `GenerateUuid`, `HasFactory` | Konfigurasi fotoperiode (jam mulai, jam akhir, mode, target lux, intensitas redup). |
| `LogPeredupan` | `log_peredupans` | `id_log` (UUID) | `GenerateUuid` | Riwayat hasil perhitungan auto-dimming terhadap kondisi cahaya lingkungan. |
| `LogEnergy` | `log_energies` | `id_log` (UUID) | `GenerateUuid`, `HasFactory` | Riwayat pembacaan daya listrik (watt) dari sensor arus/tegangan. |
| `ReadSensor` | `read__sensors` | `id_read_sensor` (UUID) | `GenerateUuid`, `HasFactory` | Riwayat pembacaan telemetri lingkungan (lux cahaya, suhu udara). |
| `SiklusPanen` | `siklus_panens` | `id_siklus_panen` (UUID) | `GenerateUuid`, `HasFactory` | Siklus budidaya buah naga dari penyinaran, pembungaan, hingga panen. |
| `PaketLangganan` | `paket_langganans` | `id_paket` (UUID) | `GenerateUuid`, `HasFactory` | Master katalog paket langganan (nama, harga, jumlah hari). |
| `LanggananTenant` | `langganan_tenants` | `id_langganan` (UUID) | `GenerateUuid` | Status aktif billing tenant. Memuat logika `sisaHariAktual()` dan `statusEfektif()`. |
| `TransaksiLangganan`| `transaksi_langganans`| `id_transaksi` (UUID) | `GenerateUuid` | Rekaman transaksi pembelian (manual transfer atau Midtrans online). |
| `Notifikasi` | `notifikasis` | `id_notifikasi` (UUID) | `GenerateUuid` | Notifikasi in-app untuk akun tenant. |
| `LogAktivitasAdmin` | `log_aktivitas_admins`| `id_log` (UUID) | `GenerateUuid` | Audit log aktivitas Super Admin terhadap entitas sistem. |

---

## 3. Critical Edge Cases & Developer Warnings

Sebelum melakukan refactoring, modifikasi skema database, atau penambahan fitur baru, perhatikan aturan teknis wajib berikut:

1. **Aturan Transaksi Finansial & Concurrency:**
   - Pada verifikasi transaksi (`LanggananService::verifikasiPembelian`), selalu gunakan `DB::transaction()` bersama `lockForUpdate()`. Kegagalan menyertakan row lock dapat menyebabkan *race condition* di mana penambahan hari langganan terjadi ganda jika dua admin menekan tombol verifikasi secara simultan.
2. **Kemandirian Perhitungan Sisa Hari:**
   - Jangan pernah menghitung sisa hari langganan hanya dengan membaca kolom `sisa_hari` secara langsung dari tabel. Kolom tersebut adalah saldo awal saat verifikasi. Selalu gunakan method `LanggananTenant::sisaHariAktual()`, karena method ini mengurangi saldo hari dengan durasi hari yang telah terlewat sejak `tanggal_aktif_terakhir`.
3. **Pemberian Trial Tenant Baru:**
   - Panggilan `LanggananService::getStatus()` otomatis menerbitkan trial 7 hari jika baris langganan belum ada. Namun, di dalam fungsi verifikasi pembelian (`verifikasiPembelian`), pemanggilan dialihkan ke `cariAtauBuatLanggananTanpaTrial()`. Jangan ubah ini menjadi `getStatus()`, agar tenant baru yang langsung membeli paket berbayar tidak mendapatkan trial 7 hari siluman di atas hari yang dibelinya.
4. **Proteksi Mosquitto CLI:**
   - Pemanggilan `exec()` di `GatewayPairingService` menggunakan `escapeshellarg()` untuk seluruh argumen. Jangan pernah menggabungkan variabel string langsung ke dalam command string untuk mencegah eksekusi shell command injection.
5. **Koneksi MQTT Publisher:**
   - `MqttPublisherService` sengaja didesain bertipe *transient* (connect -> publish -> disconnect). Jangan menggantinya menjadi koneksi singleton atau daemon di lingkungan request HTTP (PHP-FPM) karena akan menyebabkan *blocking I/O timeout* jika broker Mosquitto mengalami kendala jaringan.
6. **Penanganan Nama Kolom di Tabel Tertentu:**
   - Model `SiklusPanen` menggunakan nama foreign key `block_id` (menggunakan 'ck'), merujuk ke `id_blok` pada tabel `bloks`.
   - Model `JadwalLampu` menggunakan nama kolom `instensitas_cahaya` (dengan huruf 'n' setelah 'i'). Pastikan penulisan payload dan query menyesuaikan nama kolom yang terdaftar di database migration.
