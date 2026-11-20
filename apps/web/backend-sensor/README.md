# AgroLight Backend (Laravel)

REST API, listener MQTT, dan penjadwal tugas untuk AgroLight. Laravel 13, PHP 8.3, PostgreSQL, Sanctum.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Isi `.env` (nilai bawaan `.env.example` memakai SQLite, ganti ke PostgreSQL):

| Variabel | Contoh | Fungsi |
|---|---|---|
| `APP_URL` | `http://localhost:8080` | Dasar alamat foto (`/storage/...`), harus sesuai alamat server |
| `DB_CONNECTION` | `pgsql` | Mesin database |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | `127.0.0.1`, `5432`, ... | Koneksi PostgreSQL |
| `MQTT_HOST`, `MQTT_PORT` | `127.0.0.1`, `1883` | Broker Mosquitto |
| `MQTT_BACKEND_USERNAME`, `MQTT_BACKEND_PASSWORD` | | Akun backend di broker |
| `LANGGANAN_WAJIB` | `true` | Mewajibkan langganan aktif |
| `LAMPU_TIMEZONE` | `Asia/Jakarta` | Zona waktu jendela nyala lampu |

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve          # atau layani folder public/ lewat Apache (XAMPP)
php artisan mqtt:listen    # proses terpisah untuk menerima telemetri
```

Setelah mengubah `.env`, jalankan `php artisan config:clear` (atau `config:cache` di produksi).

## Tugas terjadwal

Picu `php artisan schedule:run` tiap menit (cron atau Task Scheduler). Isinya: `CekLanggananAkanHabis` (08:00) dan `lampu:pangkas-data` (03:00, zona Asia/Jakarta).

## Pengujian

```bash
php artisan config:clear
php artisan test
```

## Upload file

| Jenis | Disk | Lokasi |
|---|---|---|
| Foto kebun dan blok | `public` | `storage/app/public/foto_kebun/ dan foto_blok/ (per TAHUN/BULAN)` |
| Bukti transfer | `local` | `storage/app/private/bukti_transfer/TAHUN/BULAN/`, hanya lewat endpoint terautentikasi |

Aturan terpusat di `FileUploadTrait::aturanValidasiFoto()`: JPEG, PNG, JPG, atau WebP, maksimal 2 MB, maksimal 4096 x 4096 px. Tipe file dicek dari isi file. Folder `storage` perlu bisa ditulis oleh pengguna web server dan ikut dibackup.

## Keamanan singkat

- Semua rute petani memakai `auth:sanctum`, cek tenant aktif, dan cek langganan aktif.
- Akses kebun, blok, dan node dicek lewat Policy per tenant.
- `qr/scan` dibatasi `throttle:30,1`, dan `gateway/pair` dibatasi `throttle:10,1`.

---

## ASCII TREE

```
backend-sensor/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── CekLanggananAkanHabis.php
│   │       └── MqttListen.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── admin/
│   │   │   │   ├── LanggananAdminController.php
│   │   │   │   ├── LogAktivitasController.php
│   │   │   │   ├── PaketLanggananAdminController.php
│   │   │   │   ├── TenantAdminController.php
│   │   │   │   └── UserAdminController.php
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php
│   │   │   ├── petani/
│   │   │   │   ├── AutoDimmingController.php
│   │   │   │   ├── BlokController.php
│   │   │   │   ├── BlokStatusController.php
│   │   │   │   ├── GatewayController.php
│   │   │   │   ├── JadwalLampuController.php
│   │   │   │   ├── KebunController.php
│   │   │   │   ├── KodeQrController.php
│   │   │   │   ├── LanggananController.php
│   │   │   │   ├── LogEnergyController.php
│   │   │   │   ├── NodeController.php
│   │   │   │   ├── NotifikasiController.php
│   │   │   │   ├── SiklusPanenController.php
│   │   │   │   ├── TelemetriController.php
│   │   │   │   └── TenantAccessController.php
│   │   │   └── Controller.php
│   │   ├── Middleware/
│   │   │   ├── EnsureIsSuperAdmin.php
│   │   │   ├── EnsureLanggananAktif.php
│   │   │   └── EnsureTenantAktif.php
│   │   └── Requests/
│   │       ├── Auth/
│   │       │   ├── LoginRequest.php
│   │       │   └── RegisterRequest.php
│   │       ├── blok/
│   │       │   ├── addBlokRequest.php
│   │       │   └── updateBlokRequest.php
│   │       ├── gateway/
│   │       │   ├── addGatewayRequest.php
│   │       │   ├── pairGatewayRequest.php
│   │       │   └── updateGatewayRequest.php
│   │       ├── jadwalLampu/
│   │       │   ├── addJadwalLampuRequest.php
│   │       │   └── updateJadwalLampuRequest.php
│   │       ├── kebun/
│   │       │   ├── AddKebunRequest.php
│   │       │   └── UpdateKebunRequest.php
│   │       ├── langganan/
│   │       │   ├── AjukanPembelianLanggananRequest.php
│   │       │   └── TolakTransaksiRequest.php
│   │       ├── node/
│   │       │   ├── addNodeRequest.php
│   │       │   └── updateNodeRequest.php
│   │       ├── paketLangganan/
│   │       │   ├── StorePaketLanggananRequest.php
│   │       │   └── UpdatePaketLanggananRequest.php
│   │       ├── qr/
│   │       │   ├── addQrRequest.php
│   │       │   ├── scanQrRequest.php
│   │       │   └── updateQrRequest.php
│   │       ├── siklusPanen/
│   │       │   ├── addSiklusPanenRequest.php
│   │       │   └── updateSiklusPanenRequest.php
│   │       └── userAdmin/
│   │           └── StoreUserRequest.php
│   ├── Models/
│   │   ├── Blok.php
│   │   ├── Gateway.php
│   │   ├── JadwalLampu.php
│   │   ├── Kebun.php
│   │   ├── KodeQr.php
│   │   ├── LanggananTenant.php
│   │   ├── LogAktivitasAdmin.php
│   │   ├── LogEnergy.php
│   │   ├── LogPeredupan.php
│   │   ├── NodeSensor.php
│   │   ├── Notifikasi.php
│   │   ├── PaketLangganan.php
│   │   ├── QrScanLog.php
│   │   ├── ReadSensor.php
│   │   ├── SiklusPanen.php
│   │   ├── Tenant.php
│   │   ├── TransaksiLangganan.php
│   │   └── User.php
│   ├── Policies/
│   │   └── KebunPolicy.php
│   ├── Services/
│   │   ├── management_admin/
│   │   │   ├── LogAktivitasService.php
│   │   │   ├── PaketLanggananAdminService.php
│   │   │   ├── TenantAdminService.php
│   │   │   └── UserAdminService.php
│   │   ├── management_kebun/
│   │   │   ├── AutoDimmingService.php
│   │   │   ├── BlokService.php
│   │   │   ├── BlokStatusService.php
│   │   │   ├── GatewayPairingService.php
│   │   │   ├── GatewayService.php
│   │   │   ├── JadwalLampuService.php
│   │   │   ├── KebunService.php
│   │   │   ├── KodeQrService.php
│   │   │   ├── LogEnergyService.php
│   │   │   ├── MqttPublisherService.php
│   │   │   ├── NodeService.php
│   │   │   ├── QrScanService.php
│   │   │   ├── SiklusPanenService.php
│   │   │   ├── TelemetriProcessorService.php
│   │   │   └── TelemetriService.php
│   │   ├── management_langganan/
│   │   │   └── LanggananService.php
│   │   ├── management_notifikasi/
│   │   │   └── NotifikasiService.php
│   │   └── AuthService.php
│   └── Traits/
│       ├── concern/
│       │   └── HandlesTenantAccess.php
│       ├── ApiResponser.php
│       ├── FileUploadTrait.php
│       └── GenerateUuid.php
├── bootstrap/
│   ├── app.php
│   └── providers.php
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── cors.php
│   ├── database.php
│   ├── filesystems.php
│   ├── lampu.php
│   ├── langganan.php
│   ├── logging.php
│   ├── mail.php
│   ├── queue.php
│   ├── sanctum.php
│   ├── services.php
│   └── session.php
├── database/
│   └── migrations/
│       ├── 0001_01_01_000001_create_cache_table.php
│       ├── 0001_01_01_000002_create_jobs_table.php
│       ├── 2026_08_21_092214_create_personal_access_tokens_table.php
│       ├── 2026_08_21_103818_create_tenants_table.php
│       ├── 2026_08_22_000000_create_users_table.php
│       ├── 2026_08_22_082135_create_transaksi_langganans_table.php
│       ├── 2026_08_22_083101_create_langganan_tenants_table.php
│       ├── 2026_08_23_003311_create_kebuns_table.php
│       ├── 2026_08_23_003353_create_bloks_table.php
│       ├── 2026_08_23_003423_create_siklus_panens_table.php
│       ├── 2026_08_23_003500_create_kode_qrs_table.php
│       ├── 2026_08_23_003558_create_gateways_table.php
│       ├── 2026_08_23_003632_create_node_sensors_table.php
│       ├── 2026_08_23_003710_create_read__sensors_table.php
│       ├── 2026_08_23_003812_create_jadwal_lampus_table.php
│       ├── 2026_08_23_003925_create_log_peredupans_table.php
│       ├── 2026_08_23_003951_create_log_energies_table.php
│       ├── 2026_08_30_000648_add_is_admin_allowed_to_tenants_table.php
│       ├── 2026_09_15_131435_create_qr_scan_logs_table.php
│       ├── 2026_09_16_113657_add_estimasi_fields_to_siklus_panens_table.php
│       ├── 2026_09_28_022310_create_paket_langganans_table.php
│       ├── 2026_09_28_031318_add_payment_fields_to_transaksi_langganans_table.php
│       ├── 2026_10_02_021910_add_is_aktif_to_tenants_table.php
│       ├── 2026_10_03_014830_add_alasan_penolakan_to_transaksi_langganans_table.php
│       ├── 2026_10_03_015341_create_notifikasis_table.php
│       ├── 2026_10_03_103201_create_log_aktivitas_admins_table.php
│       └── 2026_10_05_003820_add_is_aktif_to_users_table.php
└── routes/
    ├── api.php
    ├── api/
    │   ├── admin.php
    │   ├── iot.php
    │   └── petani.php
    ├── console.php
    └── web.php
```