# 📘 Frontend Integration Guide & API Contract

Dokumen ini ditujukan sebagai panduan integrasi resmi untuk tim Frontend (Web & Mobile Application). Panduan ini memuat spesifikasi global, kontrak request-response HTTP, tipe TypeScript siap pakai, skema validasi, serta panduan error handling untuk seluruh endpoint backend AgroLight (Sistem Monitoring & Otomasi Perkebunan Buah Naga).

---

## 1. Global Specifications

### A. Base URL & Environments
| Environment | Base URL | Protokol | Keterangan |
|---|---|---|---|
| **Local Development** | `http://localhost:8000/api` | HTTP | Backend Laravel local (`php artisan serve`) |
| **Staging / QA** | `https://staging-api.agrolight.id/api` | HTTPS | Server pengujian internal |
| **Production** | `https://api.agrolight.id/api` | HTTPS | Lingkungan produksi live |

### B. Global Headers Wajib
Setiap request dari client (Axios, Fetch, React Native, dsb.) **wajib** menyertakan header berikut:
```http
Content-Type: application/json
Accept: application/json
```
> [!IMPORTANT]
> Header `Accept: application/json` wajib dikirimkan pada setiap panggilan. Tanpa header ini, Laravel akan mengembalikan response redirect (302) alih-alih JSON 422 saat terjadi kegagalan validasi form.
>
> Pengecualian: Untuk endpoint yang mengunggah file (seperti upload bukti transfer atau foto kebun/blok), hilangkan header `Content-Type: application/json` agar browser/HTTP client otomatis mengisi `multipart/form-data; boundary=...`.

### C. Authentication Flow & Token Lifecycle
1. **Mekanisme Autentikasi:** Menggunakan **Laravel Sanctum Bearer Token** (`PersonalAccessToken`).
2. **Pengiriman Token:** Sertakan token pada header HTTP:
   ```http
   Authorization: Bearer <token_dari_login_atau_register>
   ```
3. **Session Policy:** 
   - Backend membatasi 1 sesi aktif per login (token lama otomatis dihapus saat user login kembali).
   - Jika akun dinonaktifkan oleh Super Admin, seluruh token user yang bersangkutan otomatis dicabut (`tokens()->delete()`).
4. **Multi-Tenancy & Authorization Context:**
   - Setiap petani terasosiasi secara mutlak dengan 1 `tenant_id`. Scoping data petani diselesaikan secara otomatis dari user login di backend tanpa perlu mengirim `tenant_id` manual di body/query.
   - Super Admin memiliki hak global, namun untuk mengakses data operasional spesifik kebun suatu tenant, wajib menyertakan `tenant_id` dan telah mendapatkan persetujuan akses (*consent*) dari pemilik tenant melalui modul `AksesTenant`.

### D. Envelope Response Format
Backend menggunakan format JSON envelope terstandarisasi (`ApiResponser`).

#### 1. Success Response Envelope (Single Object)
```json
{
  "status": "succes",
  "pesan": "Operasi berhasil dilakukan.",
  "data": { ... }
}
```
*(Catatan teknis: Properti status bernilai literal `"succes"` sesuai implementasi base controller).*

#### 2. Success Response Envelope (Paginated List)
```json
{
  "status": "succes",
  "pesan": null,
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 45,
    "last_page": 3
  }
}
```

#### 3. Standard Error Envelope
```json
{
  "status": "error",
  "pesan": "Keterangan pesan kesalahan yang deskriptif."
}
```

#### 4. Validation Error Envelope (HTTP 422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "Format email tidak valid.",
      "Email sudah terdaftar di sistem."
    ],
    "password": [
      "Password minimal harus 8 karakter."
    ]
  }
}
```

---

## 2. API Endpoints Catalog

---

### MODUL 1: AUTENTIKASI (AUTH)

---

### [POST] `/auth/register`
- **Deskripsi:** Mendaftarkan tenant (perusahaan/kebun) baru sekaligus membuat akun user pemilik utama bertindak sebagai `petani_biasa`. Otomatis menerbitkan paket trial 7 hari dan bearer token.
- **Access Level:** Public (Tidak butuh token).
- **Middlewares:** `api`

#### A. Request Contract
- **Headers:** `Content-Type: application/json`, `Accept: application/json`
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `nama_tenant` | `string` | Ya | Max 100 karakter. Nama perkebunan/usaha tani. |
  | `nama_lengkap` | `string` | Ya | Max 100 karakter. Nama lengkap petani. |
  | `email` | `string` | Ya | Format email valid, unik di tabel `users`. Max 100 karakter. |
  | `password` | `string` | Ya | Minimal 8 karakter, wajib dikonfirmasi. |
  | `password_confirmation` | `string` | Ya | Wajib sama persis dengan `password`. |

```json
{
  "nama_tenant": "Kebun Naga Banyuwangi Makmur",
  "nama_lengkap": "Budi Santoso",
  "email": "budi.naga@gmail.com",
  "password": "PasswordRahasia123!",
  "password_confirmation": "PasswordRahasia123!"
}
```

#### B. Response Contract
- **TypeScript Types:**
  ```typescript
  export interface UserProfile {
    id: string;
    tenant_id: string;
    nama_lengkap: string;
    email: string;
    role: 'petani_biasa' | 'superAdmin';
    is_aktif: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface AuthRegisterResponse {
    status: 'succes';
    pesan: string;
    data: {
      user: UserProfile;
      token: string;
    };
  }
  ```
- **Contoh Success Response (201 Created):**
  ```json
  {
    "status": "succes",
    "pesan": "Registrasi berhasil. Selamat datang di AgroLight!",
    "data": {
      "user": {
        "id": "9d3e8783-05ef-4d43-982e-9d2fe7489110",
        "tenant_id": "9d3e8783-05bd-491e-915e-c0db724128f1",
        "nama_lengkap": "Budi Santoso",
        "email": "budi.naga@gmail.com",
        "role": "petani_biasa",
        "is_aktif": true,
        "created_at": "2026-10-13T23:00:00.000000Z",
        "updated_at": "2026-10-13T23:00:00.000000Z"
      },
      "token": "1|e5Z1sVp2U3Z5x7x8mN..."
    }
  }
  ```

#### C. Error Contract & Handling Guide
| HTTP Status | Pesan Error | Kapan Terjadi? | Aksi UI |
|---|---|---|---|
| `422 Unprocessable Entity` | Field validation errors | Email duplikat, password kurang 8 karakter, konfirmasi password tidak cocok | Tampilkan pesan error di bawah masing-masing field form input |
| `500 Internal Server Error` | Database error | Gagal eksekusi transaksi DB pembuatan tenant/user | Tampilkan toast banner error "Terjadi kesalahan server, silakan coba beberapa saat lagi" |

#### D. Frontend Integration Notes
- Simpan `token` ke Secure Storage / HTTP-only state cookie.
- Arahkan user langsung ke onboarding kebun atau Dashboard Petani.

---

### [POST] `/auth/login`
- **Deskripsi:** Melakukan autentikasi email & password user. Menghasilkan bearer token baru dan menghapus sesi token sebelumnya.
- **Access Level:** Public.
- **Middlewares:** `api`, `throttle:5,1` (Maksimal 5 percobaan per 1 menit per IP).

#### A. Request Contract
- **Headers:** `Content-Type: application/json`, `Accept: application/json`
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `email` | `string` | Ya | Format email valid. |
  | `password` | `string` | Ya | String password akun. |

```json
{
  "email": "budi.naga@gmail.com",
  "password": "PasswordRahasia123!"
}
```

#### B. Response Contract
- **TypeScript Types:**
  ```typescript
  export interface AuthLoginResponse {
    status: 'succes';
    pesan: string;
    data: {
      user: UserProfile;
      role: 'petani_biasa' | 'superAdmin';
      token: string;
    };
  }
  ```
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Login sukses.",
    "data": {
      "user": {
        "id": "9d3e8783-05ef-4d43-982e-9d2fe7489110",
        "tenant_id": "9d3e8783-05bd-491e-915e-c0db724128f1",
        "nama_lengkap": "Budi Santoso",
        "email": "budi.naga@gmail.com",
        "role": "petani_biasa",
        "is_aktif": true,
        "created_at": "2026-10-13T23:00:00.000000Z",
        "updated_at": "2026-10-13T23:00:00.000000Z"
      },
      "role": "petani_biasa",
      "token": "2|h9K1pLs9R2V7mX0nQ..."
    }
  }
  ```

#### C. Error Contract & Handling Guide
| HTTP Status | Pesan Error | Kapan Terjadi? | Aksi UI |
|---|---|---|---|
| `401 Unauthorized` | `"Email atau password salah."` | Kredensial tidak cocok | Tampilkan alert box "Email atau kata sandi tidak valid" |
| `403 Forbidden` | `"Akun ini dinonaktifkan. Hubungi admin AgroLight."` | Akun di-suspend (`is_aktif = false`) | Buka modal kontak customer service / admin |
| `429 Too Many Requests` | `"Too Many Attempts."` | Melebihi 5x request per menit | Kunci tombol login dan tampilkan hitung mundur 60 detik |

---

### [POST] `/auth/logout`
- **Deskripsi:** Menghapus bearer token sesi aktif di database server.
- **Access Level:** Authenticated (`auth:sanctum`).
- **Middlewares:** `api`, `auth:sanctum`

#### A. Request Contract
- **Headers:** `Authorization: Bearer <token>`, `Accept: application/json`
- **Body:** None.

#### B. Response Contract
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Berhasil logout.",
    "data": null
  }
  ```

#### C. Error Contract & Handling Guide
| HTTP Status | Pesan Error | Kapan Terjadi? | Aksi UI |
|---|---|---|---|
| `401 Unauthorized` | `"Unauthenticated."` | Token sudah kadaluarsa atau tidak dikirim | Hapus local state/storage dan redirect ke halaman Login |

---

### MODUL 2: MANAJEMEN LANGGANAN & PEMBAYARAN (PETANI)

---

### [GET] `/petani/langganan/paket`
- **Deskripsi:** Mengambil katalog paket langganan yang sedang berstatus aktif untuk dibeli petani.
- **Access Level:** Authenticated (`petani_biasa`). Tidak terkunci walau langganan habis.
- **Middlewares:** `api`, `auth:sanctum`, `EnsureTenantAktif`

#### A. Request Contract
- **Headers:** `Authorization: Bearer <token>`, `Accept: application/json`

#### B. Response Contract
- **TypeScript Types:**
  ```typescript
  export interface PaketLanggananItem {
    id_paket: string;
    nama_paket: string;
    tambahan_hari: number;
    harga: number;
    status_aktif: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface PaketLanggananResponse {
    status: 'succes';
    pesan: string | null;
    data: PaketLanggananItem[];
  }
  ```
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": null,
    "data": [
      {
        "id_paket": "9d412a81-12ef-4e92-bc10-ef129a391100",
        "nama_paket": "Paket Musim 1 Bulan",
        "tambahan_hari": 30,
        "harga": 150000,
        "status_aktif": true,
        "created_at": "2026-09-28T02:30:00.000000Z",
        "updated_at": "2026-09-28T02:30:00.000000Z"
      },
      {
        "id_paket": "9d412a81-12ef-4e92-bc10-ef129a391101",
        "nama_paket": "Paket Panen Raya 3 Bulan",
        "tambahan_hari": 90,
        "harga": 400000,
        "status_aktif": true,
        "created_at": "2026-09-28T02:30:00.000000Z",
        "updated_at": "2026-09-28T02:30:00.000000Z"
      }
    ]
  }
  ```

---

### [GET] `/petani/langganan/status`
- **Deskripsi:** Mengambil status langganan tenant saat ini, sisa hari aktif aktual, dan status masa tenggang (*grace period*).
- **Access Level:** Authenticated (`petani_biasa`). Tetap bisa diakses saat langganan expired.
- **Middlewares:** `api`, `auth:sanctum`, `EnsureTenantAktif`

#### A. Request Contract
- **Headers:** `Authorization: Bearer <token>`, `Accept: application/json`

#### B. Response Contract
- **TypeScript Types:**
  ```typescript
  export interface StatusLanggananResponse {
    status: 'succes';
    pesan: string | null;
    data: {
      status_langganan: 'aktif' | 'tenggang' | 'kadaluarsa';
      sisa_hari: number;
      dalam_masa_tenggang: boolean;
    };
  }
  ```
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": null,
    "data": {
      "status_langganan": "aktif",
      "sisa_hari": 24,
      "dalam_masa_tenggang": false
    }
  }
  ```

#### C. Error Contract & Handling Guide
| HTTP Status | Pesan Error | Kapan Terjadi? | Aksi UI |
|---|---|---|---|
| `403 Forbidden` | `"Akun ini tidak terhubung ke tenant."` | User tidak punya relasi tenant | Hubungi support / redirect ke error state |

---

### [POST] `/petani/langganan/beli`
- **Deskripsi:** Mengajukan pembelian paket langganan secara manual via transfer bank dengan mengunggah bukti transfer. Status awal transaksi adalah `menunggu_verifikasi`.
- **Access Level:** Authenticated (`petani_biasa`).
- **Middlewares:** `api`, `auth:sanctum`, `EnsureTenantAktif`

#### A. Request Contract
- **Headers:** `Authorization: Bearer <token>`, `Accept: application/json` *(Jangan set `Content-Type: application/json`, biarkan multipart boundary)*
- **Request Body (FormData):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `paket_langganan_id` | `uuid` | Ya | Wajib ada di tabel `paket_langganans.id_paket`. |
  | `bukti_transfer` | `File` (Image) | Ya | Format: jpeg, png, jpg, webp. Maksimal 2MB (2048 KB). |

#### B. Response Contract
- **TypeScript Types:**
  ```typescript
  export interface TransaksiLanggananItem {
    id_transaksi: string;
    tenant_id: string;
    paket_langganan_id: string;
    nama_paket: string;
    tambahan_hari: number;
    harga: number;
    metode_pembayaran: 'manual_transfer' | 'midtrans';
    status_pembayaran: 'menunggu_verifikasi' | 'berhasil' | 'ditolak' | 'menunggu_pembayaran';
    alasan_penolakan: string | null;
    bukti_transfer: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface BeliLanggananResponse {
    status: 'succes';
    pesan: string;
    data: TransaksiLanggananItem;
  }
  ```
- **Contoh Success Response (201 Created):**
  ```json
  {
    "status": "succes",
    "pesan": "Pengajuan pembelian berhasil dikirim, menunggu verifikasi admin.",
    "data": {
      "id_transaksi": "9d421f10-189a-412f-901b-c12891fa1002",
      "tenant_id": "9d3e8783-05bd-491e-915e-c0db724128f1",
      "paket_langganan_id": "9d412a81-12ef-4e92-bc10-ef129a391100",
      "nama_paket": "Paket Musim 1 Bulan",
      "tambahan_hari": 30,
      "harga": 150000,
      "metode_pembayaran": "manual_transfer",
      "status_pembayaran": "menunggu_verifikasi",
      "bukti_transfer": "bukti_transfer/2026/10/xyz123abc.jpg",
      "created_at": "2026-10-13T23:10:00.000000Z",
      "updated_at": "2026-10-13T23:10:00.000000Z"
    }
  }
  ```

#### C. Error Contract & Handling Guide
| HTTP Status | Pesan Error | Kapan Terjadi? | Aksi UI |
|---|---|---|---|
| `422 Unprocessable Entity` | `"bukti_transfer must be an image..."` | File bukan gambar atau > 2MB | Beritahu user untuk kompres gambar atau pilih format PNG/JPG |
| `404 Not Found` | Model not found | Paket langganan tidak ditemukan / sudah nonaktif | Refresh katalog paket langganan |

---

### [POST] `/petani/langganan/beli-online`
- **Deskripsi:** Memulai transaksi pembayaran instan online menggunakan Midtrans Payment Gateway. Mengembalikan token Snap Midtrans untuk dibuka di popup client.
- **Access Level:** Authenticated (`petani_biasa`).
- **Middlewares:** `api`, `auth:sanctum`, `EnsureTenantAktif`

#### A. Request Contract
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `paket_langganan_id` | `uuid` | Ya | Wajib valid di tabel `paket_langganans`. |

```json
{
  "paket_langganan_id": "9d412a81-12ef-4e92-bc10-ef129a391100"
}
```

#### B. Response Contract
- **TypeScript Types:**
  ```typescript
  export interface BeliOnlineResponse {
    status: 'succes';
    pesan: string;
    data: {
      id_transaksi: string;
      snap_token: string;
    };
  }
  ```
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Snap token berhasil dibuat",
    "data": {
      "id_transaksi": "9d421f10-189a-412f-901b-c12891fa1002",
      "snap_token": "6689d04b-3549-41e9-9132-fa3b194092b3"
    }
  }
  ```

#### C. Frontend Integration Notes
- Gunakan SDK Midtrans Snap (`window.snap.pay(snap_token, { onSuccess, onPending, onError, onClose })`).
- Setelah Midtrans callback berhasil, lakukan refetch status langganan ke `/petani/langganan/status`.

---

### MODUL 3: KONSEN PRIVASI & AKSES TENANT (PETANI SIDE)

---

### [GET] `/petani/akses-tenant`
- **Deskripsi:** Menampilkan riwayat permohonan akses dari Super Admin yang ingin menginspeksi atau mengelola kebun tenant ini.
- **Access Level:** Authenticated (`petani_biasa`).
- **Middlewares:** `api`, `auth:sanctum`

#### A. Response Contract
- **TypeScript Types:**
  ```typescript
  export interface PermintaanAksesItem {
    id: string;
    tenant_id: string;
    admin_id: string;
    status: 'pending' | 'disetujui' | 'ditolak' | 'dicabut';
    alasan_permintaan: string | null;
    alasan_penolakan: string | null;
    diminta_pada: string;
    diputuskan_pada: string | null;
    diputuskan_oleh: string | null;
    admin?: {
      id: string;
      nama_lengkap: string;
    };
  }
  ```
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Riwayat permintaan akses Super Admin berhasil diambil.",
    "data": [
      {
        "id": "9d435210-98fe-4a21-bc10-ef129a009123",
        "tenant_id": "9d3e8783-05bd-491e-915e-c0db724128f1",
        "admin_id": "9d3e8783-05ef-4d43-982e-9d2fe7489001",
        "status": "pending",
        "alasan_permintaan": "Investigasi kendala pembacaan sensor node blok C.",
        "alasan_penolakan": null,
        "diminta_pada": "2026-10-13T22:30:00.000000Z",
        "diputuskan_pada": null,
        "diputuskan_oleh": null,
        "admin": {
          "id": "9d3e8783-05ef-4d43-982e-9d2fe7489001",
          "nama_lengkap": "Rian SuperAdmin"
        }
      }
    ]
  }
  ```

---

### [PATCH] `/petani/akses-tenant/{id}/setujui`
- **Deskripsi:** Petani memberikan persetujuan kepada Super Admin untuk mengakses kebunnya.
- **Middlewares:** `api`, `auth:sanctum`

---

### [PATCH] `/petani/akses-tenant/{id}/tolak`
- **Deskripsi:** Petani menolak permintaan akses Super Admin dengan alasan opsional.
- **Request Body (JSON):**
  ```json
  {
    "alasan": "Sedang tidak membutuhkan bantuan teknis saat ini."
  }
  ```

---

### [PATCH] `/petani/akses-tenant/{id}/cabut`
- **Deskripsi:** Petani mencabut izin Super Admin yang sebelumnya berstatus `disetujui`.

---

### MODUL 4: MANAJEMEN KEBUN (FARM MANAGEMENT)

---

### [GET] `/petani/kebun` (atau `/admin/kebun`)
- **Deskripsi:** Mengambil seluruh daftar kebun milik tenant yang login (atau milik tenant tertentu jika dipanggil oleh Super Admin).
- **Access Level:**
  - Petani: Wajib memiliki langganan aktif (`EnsureLanggananAktif`).
  - Super Admin: Wajib menyertakan query parameter `?tenant_id=UUID` dan sudah memiliki izin akses yang disetujui.
- **Middlewares:** `api`, `auth:sanctum`, `EnsureTenantAktif`, `EnsureLanggananAktif`

#### A. Request Contract
- **Headers:** `Authorization: Bearer <token>`, `Accept: application/json`
- **Query Parameters:**
  | Parameter | Tipe Data | Default | Deskripsi |
  |---|---|---|---|
  | `tenant_id` | `uuid` | null | **Wajib disertakan HANYA jika pemanggil adalah Super Admin**. |

#### B. Response Contract
- **TypeScript Types:**
  ```typescript
  export interface KebunItem {
    id_kebun: string;
    tenant_id: string;
    nama_kebun: string;
    lokasi_kebun: string | null;
    url_foto: string | null;
    status_kebun: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface KebunListResponse {
    status: 'succes';
    pesan: string;
    data: KebunItem[];
  }
  ```
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Daftar kebun berhasil diambil.",
    "data": [
      {
        "id_kebun": "9d401123-01ab-4890-a102-ef9823104921",
        "tenant_id": "9d3e8783-05bd-491e-915e-c0db724128f1",
        "nama_kebun": "Kebun Naga Merah Sektor Barat",
        "lokasi_kebun": "Kec. Rogojampi, Banyuwangi",
        "url_foto": "foto_kebun/2026/10/kebun_barat.jpg",
        "status_kebun": true,
        "created_at": "2026-10-10T10:00:00.000000Z",
        "updated_at": "2026-10-10T10:00:00.000000Z"
      }
    ]
  }
  ```

#### C. Error Contract & Handling Guide
| HTTP Status | Pesan Error | Kapan Terjadi? | Aksi UI |
|---|---|---|---|
| `402 Payment Required` | `"Langganan sudah habis dan masa tenggang sudah lewat. Silakan beli paket untuk melanjutkan."` | Masa langganan tenant kadaluarsa | Kunci fitur dan tampilkan banner/modal "Beli Paket Langganan Sekarang" |
| `400 Bad Request` | `"Super Admin wajib menyertakan tenant_id (?tenant_id=...)."` | Super admin panggil endpoint tanpa tenant_id | Pastikan selector tenant di dashboard admin terisi |
| `403 Forbidden` | `"Anda belum mendapat izin akses ke tenant ini."` | Super admin belum disetujui izinnya | Tampilkan form tombol "Ajukan Permintaan Akses" |

---

### [POST] `/petani/kebun` (atau `/admin/kebun`)
- **Deskripsi:** Membuat kebun baru dengan upload foto opsional.
- **Request Body (FormData atau JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `nama_kebun` | `string` | Ya | Max 100 karakter. |
  | `lokasi_kebun` | `string` | Tidak | Max 100 karakter. |
  | `foto` | `File` (Image) | Tidak | jpeg, png, jpg, webp. Maksimal 2MB. |
  | `status_kebun` | `boolean` | Tidak | Default `true`. |
  | `tenant_id` | `uuid` | Khusus Admin | Wajib jika dipanggil oleh Super Admin. |

- **Contoh Success Response (201 Created):**
  ```json
  {
    "status": "succes",
    "pesan": "Kebun berhasil ditambahkan.",
    "data": {
      "id_kebun": "9d401123-01ab-4890-a102-ef9823104921",
      "tenant_id": "9d3e8783-05bd-491e-915e-c0db724128f1",
      "nama_kebun": "Kebun Naga Merah Sektor Timur",
      "lokasi_kebun": "Kec. Kabat, Banyuwangi",
      "url_foto": "foto_kebun/2026/10/kebun_timur.jpg",
      "status_kebun": true,
      "created_at": "2026-10-13T23:15:00.000000Z",
      "updated_at": "2026-10-13T23:15:00.000000Z"
    }
  }
  ```

---

### [GET] `/petani/kebun/{id}`
- **Deskripsi:** Detail satu kebun berdasarkan UUID.
- **Error 404:** `"Data kebun tidak ditemukan."`

---

### [PUT|PATCH] `/petani/kebun/{id}`
- **Deskripsi:** Memperbarui nama, lokasi, status, atau foto kebun. Foto lama akan otomatis dihapus jika mengunggah foto baru.

---

### [DELETE] `/petani/kebun/{id}`
- **Deskripsi:** Menghapus data kebun beserta file foto fisiknya di storage.
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Kebun berhasil dihapus.",
    "data": null
  }
  ```

---

### MODUL 5: MANAJEMEN BLOK & STATUS LAMPU

---

### [GET] `/petani/blok` (atau `/admin/blok`)
- **Deskripsi:** Mengambil seluruh daftar blok dalam satu kebun spesifik.
- **Middlewares:** `api`, `auth:sanctum`, `EnsureTenantAktif`, `EnsureLanggananAktif`
- **Query Parameters:**
  | Parameter | Tipe Data | Wajib? | Deskripsi |
  |---|---|---|---|
  | `kebun_id` | `uuid` | **Wajib** | ID kebun induk yang ingin ditampilkan bloknya. |

- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Daftar blok berhasil diambil.",
    "data": [
      {
        "id_blok": "9d410291-a982-412f-9810-bb2198fa0112",
        "kebun_id": "9d401123-01ab-4890-a102-ef9823104921",
        "nama_blok": "Blok A1 - Buah Naga Putih",
        "keterangan": "Area tiang penyangga baja ringan",
        "luas_area": 1200.5,
        "url_foto": "foto_blok/2026/10/blok_a1.jpg",
        "created_at": "2026-10-11T08:00:00.000000Z",
        "updated_at": "2026-10-11T08:00:00.000000Z",
        "kebun": {
          "id_kebun": "9d401123-01ab-4890-a102-ef9823104921",
          "nama_kebun": "Kebun Naga Merah Sektor Barat"
        }
      }
    ]
  }
  ```

---

### [GET] `/petani/blok/{id}/status-lampu`
- **Deskripsi:** Mengambil statistik kesehatan koneksi lampu dan status online node sensor pada suatu blok secara real-time. Status online dievaluasi berdasarkan ambang heartbeat terakhir (`config('lampu.offline_setelah_detik', 20)`).
- **Middlewares:** `api`, `auth:sanctum`, `EnsureTenantAktif`, `EnsureLanggananAktif`

#### A. Response Contract
- **TypeScript Types:**
  ```typescript
  export interface NodeStatusLampuItem {
    id_sensor: string;
    kode_perangkat: string;
    status_online: boolean;
    terakhir_terlihat: string | null;
  }

  export interface BlokStatusLampuResponse {
    status: 'succes';
    pesan: string;
    data: {
      jumlah_lampu: number;
      jumlah_online: number;
      jumlah_offline: number;
      batas_offline_detik: number;
      nodes: NodeStatusLampuItem[];
    };
  }
  ```
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Status lampu per blok berhasil diambil.",
    "data": {
      "jumlah_lampu": 4,
      "jumlah_online": 3,
      "jumlah_offline": 1,
      "batas_offline_detik": 20,
      "nodes": [
        {
          "id_sensor": "9d429a10-87a1-4321-9981-aa1109438101",
          "kode_perangkat": "NODE-NAGA-001",
          "status_online": true,
          "terakhir_terlihat": "2026-10-13T23:14:50.000000Z"
        },
        {
          "id_sensor": "9d429a10-87a1-4321-9981-aa1109438102",
          "kode_perangkat": "NODE-NAGA-002",
          "status_online": false,
          "terakhir_terlihat": "2026-10-13T20:10:00.000000Z"
        }
      ]
    }
  }
  ```

---

### MODUL 6: NODE SENSOR & AUTO-DIMMING

---

### [GET] `/petani/node`
- **Deskripsi:** Mengambil daftar node sensor di suatu kebun.
- **Query Parameter:** `?kebun_id=UUID` (Wajib).

---

### [POST] `/petani/node`
- **Deskripsi:** Mendaftarkan perangkat node sensor baru ke suatu blok dan gateway. Otomatis menghasilkan kode QR stok jika `qr_id` tidak disertakan.
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `blok_id` | `uuid` | Ya | Valid & unik (1 blok 1 node sensor). |
  | `gateway_id` | `uuid` | Ya | Wajib valid di tabel `gateways`. |
  | `kode_perangkat` | `string` | Ya | Unik. Contoh: `"NODE-ESP-01"`. |
  | `tipe_sensor` | `string` | Ya | Contoh: `"BH1750_LUX"`. |
  | `status_koneksi` | `string` | Ya | Contoh: `"aktif"`, `"siap"`. |
  | `qr_id` | `uuid` | Tidak | ID QR terdaftar. Jika kosong, dibuat otomatis. |

---

### [POST] `/petani/node/{id}/generate-qr`
- **Deskripsi:** Menghasilkan stiker QR Code baru dan mengasosiasikannya ke node sensor ini (menghapus QR lama jika ada).
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "QR Code baru berhasil di-generate dan dipasangkan ke sensor.",
    "data": {
      "id_sensor": "9d429a10-87a1-4321-9981-aa1109438101",
      "qr_id": "9d499120-1111-4444-8888-abcdef123456",
      "qr": {
        "id_qr": "9d499120-1111-4444-8888-abcdef123456",
        "teks_kode_qr": "QR-NODE-AX89QZ",
        "status_qr": true
      }
    }
  }
  ```

---

### [POST] `/petani/sensor/{sensorId}/dimming`
- **Deskripsi:** Endpoint kalkulasi simulasi algoritma auto-dimming. Menghitung intensitas redup lampu berdasarkan nilai pembacaan lux cahaya alami lingkungan terhadap target lux jadwal aktif.
- **Middlewares:** `api`, `auth:sanctum`, `EnsureTenantAktif`, `EnsureLanggananAktif`
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `nilai_lux` | `number` | Ya | Min: 0. Nilai pembacaan sensor cahaya. |
  | `fase_bulan` | `string` | Tidak | Contoh: `"bulan_purnama"`, `"bulan_mati"`. |

```json
{
  "nilai_lux": 45.5,
  "fase_bulan": "bulan_purnama"
}
```

- **Rumus Logika Internal Server:**
  $$\text{mentah} = \left(\frac{\text{target\_lux} - \text{nilai\_lux}}{\text{target\_lux}}\right) \times 100$$
  $$\text{persentase} = \max(\text{intensitas\_minimum}, \min(100, \text{mentah}))$$

- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Perhitungan auto dimming berhasil dicatat.",
    "data": {
      "id_log": "9d45a190-21ba-4821-bc91-998129fa0123",
      "sensor_id": "9d429a10-87a1-4321-9981-aa1109438101",
      "presentase_redup": 54.5,
      "nilai_lux": 45.5,
      "fase_bulan": "bulan_purnama",
      "dicatat_pada": "2026-10-13T23:18:00.000000Z"
    }
  }
  ```

---

### MODUL 7: HARDWARE GATEWAY & CAPTIVE PORTAL PAIRING

---

### [POST] `/petani/gateway/pair`
- **Deskripsi:** Dipanggil langsung oleh firmware mikrokontroler (ESP32 Gateway) setelah terhubung ke internet untuk menukarkan kode pairing captive portal dengan token otentikasi permanen MQTT.
- **Access Level:** **Public Device Endpoint** (Tanpa Bearer Token User).
- **Middlewares:** `throttle:10,1`, `withoutMiddleware('auth:sanctum')`
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `kode_perangkat` | `string` | Ya | Mac address atau serial gateway. |
  | `kode_pairing` | `string` | Ya | Kode 6 karakter sekali pakai (contoh: `"PAIR-XYZ123"`). |

```json
{
  "kode_perangkat": "GW-AGRO-BANYUWANGI-01",
  "kode_pairing": "PAIR-AK98Q1"
}
```

- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Gateway berhasil dipasangkan.",
    "data": {
      "gateway_id": "9d422910-189a-412f-901b-c12891fa0001",
      "token_gateway": "f9a8b7c6d5e4f3a2b1c0...60_character_random_secret_token..."
    }
  }
  ```

- **Catatan Keamanan Mikrokontroler:**
  Setelah pairing berhasil, kode pairing dihapus permanen (`null`). Token yang diterima disimpan di NVS/EEPROM ESP32 dan dijadikan password otentikasi koneksi MQTT ke broker Mosquitto.

---

### MODUL 8: SCANNER QR CODE LAPANGAN

---

### [POST] `/petani/qr/scan`
- **Deskripsi:** Dipanggil oleh aplikasi mobile saat kamera memindai stiker QR fisik di tiang pohon buah naga. Memvalidasi isolasi tenant dan mencatat audit scan log beserta koordinat GPS.
- **Middlewares:** `api`, `auth:sanctum`, `EnsureTenantAktif`, `EnsureLanggananAktif`
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `teks_kode_qr` | `string` | Ya | Teks hasil scan kamera. Contoh: `"QR-NODE-AX89QZ"`. |
  | `platform` | `string` | Tidak | Enum: `'android'` atau `'ios'`. |
  | `latitude` | `number` | Tidak | Koordinat GPS perangkat (-90 s/d 90). |
  | `longitude` | `number` | Tidak | Koordinat GPS perangkat (-180 s/d 180). |

```json
{
  "teks_kode_qr": "QR-NODE-AX89QZ",
  "platform": "android",
  "latitude": -8.219234,
  "longitude": 114.369123
}
```

- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Scan berhasil, data blok/sensor ditemukan.",
    "data": {
      "id_sensor": "9d429a10-87a1-4321-9981-aa1109438101",
      "kode_perangkat": "NODE-NAGA-001",
      "tipe_sensor": "BH1750_LUX",
      "status_koneksi": "terhubung",
      "blok": {
        "id_blok": "9d410291-a982-412f-9810-bb2198fa0112",
        "nama_blok": "Blok A1 - Buah Naga Putih",
        "kebun": {
          "id_kebun": "9d401123-01ab-4890-a102-ef9823104921",
          "nama_kebun": "Kebun Naga Merah Sektor Barat",
          "tenant_id": "9d3e8783-05bd-491e-915e-c0db724128f1"
        }
      }
    }
  }
  ```

#### Error Contract Khusus Scan QR:
| HTTP Status | Pesan Error | Kapan Terjadi? |
|---|---|---|
| `403 Forbidden` | `"Kode QR tidak ditemukan atau sudah nonaktif."` | QR belum terdaftar atau `status_qr = false` |
| `403 Forbidden` | `"QR belum terpasang ke node sensor manapun."` | QR masih berstatus stok fisik belum di-pairing |
| `403 Forbidden` | `"Anda tidak memiliki akses ke blok ini."` | Petani memindai QR milik kebun/tenant lain |

---

### [GET] `/petani/qr/logs`
- **Deskripsi:** Mengambil 50 riwayat aktivitas scan QR terakhir oleh user yang sedang login.

---

### MODUL 9: JADWAL PENYINARAN LAMPU (LIGHTING SCHEDULE)

---

### [GET] `/petani/jadwal-lampu`
- **Deskripsi:** Mengambil jadwal lampu berdasarkan `kebun_id` atau `sensor_id`.
- **Query Parameter:** Wajib salah satu: `?kebun_id=UUID` atau `?sensor_id=UUID`.

---

### [GET] `/petani/jadwal-lampu/aktif`
- **Deskripsi:** Mengambil satu jadwal aktif efektif yang sedang mengendalikan node sensor tertentu (memprioritaskan override jadwal spesifik node, fallback ke jadwal default kebun).
- **Query Parameter:** `?sensor_id=UUID` (Wajib).

---

### [POST] `/petani/jadwal-lampu`
- **Deskripsi:** Membuat konfigurasi jadwal penyinaran baru. Otomatis menonaktifkan jadwal aktif sebelumnya dan memicu pesan MQTT sinkronisasi ke mikrokontroler.
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `kebun_id` | `uuid` | Kondisional | Wajib jika `sensor_id` tidak ada (Default Kebun). |
  | `sensor_id` | `uuid` | Kondisional | Wajib jika `kebun_id` tidak ada (Override Node). |
  | `jam_mulai_nyala` | `string` | Ya | Format: `"HH:mm"` (Contoh: `"18:00"`). |
  | `jam_akhir_nyala` | `string` | Ya | Format: `"HH:mm"` (Contoh: `"05:00"`). Mendukung lintas tengah malam. |
  | `mode` | `string` | Ya | Enum: `"manual"` atau `"auto"`. |
  | `instensitas_cahaya` | `number` | Ya jika mode manual | Nilai 0 s/d 100 persen. |
  | `target_lux` | `number` | Ya jika mode auto | Target iluminasi lux buah naga (Contoh: 80). |
  | `intensitas_minimum` | `number` | Tidak | Batas bawah daya lampu (0 s/d 100). Default 10. |
  | `keterangan` | `string` | Tidak | Catatan jadwal penyinaran. |

```json
{
  "kebun_id": "9d401123-01ab-4890-a102-ef9823104921",
  "jam_mulai_nyala": "18:00",
  "jam_akhir_nyala": "05:00",
  "mode": "auto",
  "target_lux": 85.0,
  "intensitas_minimum": 15.0,
  "keterangan": "Penyinaran percepatan bunga gelombang 1"
}
```

---

### [PUT|PATCH] `/petani/jadwal-lampu/{id}`
- **Deskripsi:** Memperbarui parameter jadwal.
- **Proteksi Flicker & Slider Cooldown:**
  Jika mengubah `instensitas_cahaya` pada mode manual, backend menerapkan rate-limiter per-slider (cooldown 7 detik) untuk mencegah spamming perubahan daya yang merusak driver lampu LED fisik.
- **Respon Cooldown (HTTP 429):**
  ```json
  {
    "status": "error",
    "pesan": "Terlalu cepat mengubah intensitas, tunggu 5 detik lagi biar lampu nggak flicker."
  }
  ```

---

### MODUL 10: SIKLUS PANEN (HARVEST CYCLE)

---

### [GET] `/petani/siklus-panen`
- **Deskripsi:** Mengambil daftar riwayat dan siklus panen aktif pada blok tertentu.
- **Query Parameter:** `?blok_id=UUID` (Wajib).

---

### [POST] `/petani/siklus-panen`
- **Deskripsi:** Memulai siklus penyinaran dan pembungaan baru pada blok. Otomatis menghitung estimasi tanggal panen awal.
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Validasi & Rule |
  |---|---|---|---|
  | `block_id` | `uuid` | Ya | ID Blok lokasi penyinaran. *(Catatan kolom: `block_id`)* |
  | `tanggal_penyinaran` | `string` (Date) | Ya | Format: `"YYYY-MM-DD"`. |
  | `target_hari_berbunga` | `integer` | Tidak | Target hari sampai bunga muncul (default ~14-21 hari). |
  | `target_hari_panen_setelah_bunga` | `integer` | Tidak | Default: 50 hari. |

```json
{
  "block_id": "9d410291-a982-412f-9810-bb2198fa0112",
  "tanggal_penyinaran": "2026-10-15",
  "target_hari_berbunga": 18,
  "target_hari_panen_setelah_bunga": 50
}
```

---

### [PUT|PATCH] `/petani/siklus-panen/{id}`
- **Deskripsi:** Memperbarui perkembangan siklus. Begitu `tanggal_berbunga_aktual` diisi, backend otomatis mengkalkulasi ulang `estimasi_tanggal_panen` dengan akurasi tinggi.
- **Request Body (JSON):**
  | Field | Tipe Data | Wajib? | Deskripsi |
  |---|---|---|---|
  | `tanggal_berbunga_aktual` | `date` | Tidak | Tanggal bunga kuncup/mekar perdana. |
  | `tanggal_panen` | `date` | Tidak | Jika diisi, status siklus otomatis menjadi `"SELESAI"`. |
  | `status_siklus` | `string` | Tidak | Enum: `"BERJALAN"`, `"SELESAI"`, `"GAGAL"`. |

---

### MODUL 11: MONITORING TELEMETRI & LOG ENERGI LISTRIK

---

### [GET] `/petani/telemetri`
- **Deskripsi:** Mengambil deretan data pembacaan sensor cahaya (Lux) dan suhu (°C) untuk grafik pemantauan.
- **Query Parameters:**
  | Parameter | Tipe Data | Default | Deskripsi |
  |---|---|---|---|
  | `sensor_id` | `uuid` | **Wajib** | ID Node Sensor target. |
  | `limit` | `integer` | 100 | Jumlah titik data terakhir yang diambil. |

- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Data telemetri berhasil diambil.",
    "data": [
      {
        "id_read_sensor": "9d45a001-9876-4120-aa91-bc1029fa0001",
        "sensor_id": "9d429a10-87a1-4321-9981-aa1109438101",
        "nilai_lux": 12.4,
        "suhu": 27.8,
        "dicatat_pada": "2026-10-13T23:00:00.000000Z"
      },
      {
        "id_read_sensor": "9d45a001-9876-4120-aa91-bc1029fa0002",
        "sensor_id": "9d429a10-87a1-4321-9981-aa1109438101",
        "nilai_lux": 14.1,
        "suhu": 27.5,
        "dicatat_pada": "2026-10-13T23:05:00.000000Z"
      }
    ]
  }
  ```

---

### [GET] `/petani/log-energy`
- **Deskripsi:** Mengambil total akumulasi konsumsi listrik (kWh) dan log konsumsi watt lampu untuk evaluasi efisiensi biaya listrik penyinaran.
- **Query Parameters:** `sensor_id` (Wajib, UUID), `limit` (Opsional, Default: 100).

- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Data konsumsi energi berhasil diambil.",
    "data": {
      "total_kwh": 48.725,
      "riwayat": [
        {
          "id_log": "9d45b100-1122-3344-5566-778899aabbcc",
          "sensor_id": "9d429a10-87a1-4321-9981-aa1109438101",
          "konsumsi_watt": 120.5,
          "dicatat_pada": "2026-10-13T23:00:00.000000Z"
        }
      ]
    }
  }
  ```

---

### MODUL 12: NOTIFIKASI SISTEM (PETANI)

---

### [GET] `/petani/notifikasi`
- **Deskripsi:** Mengambil daftar notifikasi tenant (seperti peringatan H-3 langganan akan habis).
- **Query Parameters:** `belum_dibaca=true|false`, `per_page=15`.

---

### [PATCH] `/petani/notifikasi/{id}/dibaca`
- **Deskripsi:** Menandai satu notifikasi telah dibaca (`sudah_dibaca = true`).

---

### [PATCH] `/petani/notifikasi/tandai-semua-dibaca`
- **Deskripsi:** Menandai seluruh notifikasi tenant menjadi sudah dibaca.
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": null,
    "data": {
      "jumlah_ditandai": 4
    }
  }
  ```

---

### MODUL 13: DASHBOARD & MANAJEMEN SUPER ADMIN

Seluruh endpoint pada modul ini memiliki Base Path `/admin/...` dan diproteksi middleware `EnsureIsSuperAdmin` (`role === 'superAdmin'`).

---

### [GET] `/admin/dashboard/ringkasan`
- **Deskripsi:** Mengambil metrik global sistem (total tenant, status langganan, pendapatan rupiah, kesehatan gateway/sensor, dan log audit 10 aktivitas admin terakhir).
- **Contoh Success Response (200 OK):**
  ```json
  {
    "status": "succes",
    "pesan": "Ringkasan dashboard berhasil diambil",
    "data": {
      "tenant": {
        "total": 24,
        "aktif": 22,
        "nonaktif": 2
      },
      "user": {
        "total": 35,
        "aktif": 33,
        "nonaktif": 2,
        "per_role": {
          "petani_biasa": 31,
          "superAdmin": 4
        }
      },
      "langganan": {
        "total": 24,
        "aktif": 19,
        "tenggang": 2,
        "kadaluarsa": 3
      },
      "transaksi": {
        "total": 82,
        "menunggu_pembayaran": 3,
        "diverifikasi": 74,
        "ditolak": 5,
        "pendapatan_total": 12850000
      },
      "infrastruktur": {
        "kebun": { "total": 38, "aktif": 36, "nonaktif": 2 },
        "blok": { "total": 115 },
        "gateway": {
          "total": 42,
          "per_status": { "terhubung": 39, "terputus": 3 }
        },
        "node_sensor": {
          "total": 112,
          "per_status": { "aktif": 105, "mati": 7 },
          "per_tipe": { "BH1750_LUX": 112 }
        }
      },
      "aktivitas_terbaru": [
        {
          "id_log": "9d490123-1122-4455-8899-abcdef012345",
          "admin": "SuperAdmin Agro",
          "aksi": "verifikasi_transaksi",
          "target_tipe": "transaksi_langganan",
          "target_id": "9d421f10-189a-412f-901b-c12891fa1002",
          "keterangan": null,
          "waktu": "2026-10-13T23:12:00.000000Z"
        }
      ]
    }
  }
  ```

---

### [GET] `/admin/tenant`
- **Deskripsi:** Daftar seluruh tenant dengan ringkasan status langganan dan jumlah kebun. Mendukung paginasi (`?per_page=15`).

---

### [PATCH] `/admin/tenant/{id}/nonaktifkan` & `/admin/tenant/{id}/aktifkan`
- **Deskripsi:** Menangguhkan atau mengaktifkan kembali tenant. Jika dinonaktifkan, seluruh pengguna tenant tersebut tidak dapat melakukan login maupun mengakses resource.

---

### [POST] `/admin/tenant/{id}/minta-akses`
- **Deskripsi:** Mengajukan permintaan izin akses data tenant untuk keperluan debugging atau bantuan operasional.
- **Request Body (JSON):**
  ```json
  {
    "alasan": "Pemeriksaan anomali konsumsi daya sensor blok timur."
  }
  ```

---

### [GET] `/admin/langganan/transaksi`
- **Deskripsi:** Menampilkan daftar transaksi pembelian langganan untuk diverifikasi admin.
- **Query Parameter:** `?status=menunggu_verifikasi|berhasil|ditolak` (Default: `menunggu_verifikasi`).

---

### [PATCH] `/admin/langganan/transaksi/{id}/verifikasi`
- **Deskripsi:** Memverifikasi pembayaran transfer manual. Mengunci row dengan `lockForUpdate()`, menambahkan hari langganan ke tenant, mengubah status transaksi menjadi `berhasil`, dan mencatat ke audit log admin.

---

### [PATCH] `/admin/langganan/transaksi/{id}/tolak`
- **Deskripsi:** Menolak transfer manual yang bukti transfernya tidak valid/tidak masuk.
- **Request Body (JSON):**
  ```json
  {
    "alasan": "Bukti transfer tidak terbaca dan mutasi rekening tidak ditemukan."
  }
  ```

---

### [GET] `/admin/langganan/transaksi/{id}/bukti-transfer`
- **Deskripsi:** Mengunduh atau menampilkan file biner bukti transfer yang disimpan privat.

---

### [GET] `/admin/log-aktivitas`
- **Deskripsi:** Menampilkan seluruh log aktivitas dan tindakan administratif seluruh Super Admin.

---

## 3. Webhook & Background Ingestion

### [POST] `/webhook/midtrans`
- **Deskripsi:** Endpoint penerima notifikasi HTTP POST dari server Midtrans.
- **Keamanan:** Memvalidasi HMAC SHA-512 `signature_key` dari `order_id + status_code + gross_amount + server_key`.
- **Alur Bisnis:**
  - Status `'capture'` / `'settlement'`: Otomatis memperpanjang hari langganan tenant via `verifikasiOtomatisViaGateway()`.
  - Status `'deny'`, `'cancel'`, `'expire'`: Otomatis mengubah status transaksi menjadi `ditolak`.

---

## 4. Frontend Query Keys Recommendation (TanStack Query / SWR)

Untuk konsistensi cache invalidation pada aplikasi Frontend, gunakan struktur Query Key terpusat berikut:

```typescript
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  tenant: {
    statusLangganan: ['tenant', 'langganan', 'status'] as const,
    katalogPaket: ['tenant', 'langganan', 'paket'] as const,
    riwayatLangganan: (page: number) => ['tenant', 'langganan', 'riwayat', page] as const,
    aksesRequests: ['tenant', 'akses'] as const,
    notifikasi: (belumDibaca?: boolean) => ['tenant', 'notifikasi', { belumDibaca }] as const,
  },
  kebun: {
    all: (tenantId?: string) => ['kebun', 'list', { tenantId }] as const,
    detail: (id: string) => ['kebun', 'detail', id] as const,
  },
  blok: {
    byKebun: (kebunId: string) => ['blok', 'list', { kebunId }] as const,
    detail: (id: string) => ['blok', 'detail', id] as const,
    statusLampu: (blokId: string) => ['blok', 'statusLampu', blokId] as const,
  },
  node: {
    byKebun: (kebunId: string) => ['node', 'list', { kebunId }] as const,
    detail: (id: string) => ['node', 'detail', id] as const,
    telemetri: (sensorId: string, limit: number) => ['node', 'telemetri', sensorId, limit] as const,
    energy: (sensorId: string) => ['node', 'energy', sensorId] as const,
  },
  gateway: {
    byKebun: (kebunId: string) => ['gateway', 'list', { kebunId }] as const,
    detail: (id: string) => ['gateway', 'detail', id] as const,
  },
  jadwal: {
    byKebun: (kebunId: string) => ['jadwal', 'kebun', kebunId] as const,
    bySensor: (sensorId: string) => ['jadwal', 'sensor', sensorId] as const,
    aktif: (sensorId: string) => ['jadwal', 'aktif', sensorId] as const,
  },
  panen: {
    byBlok: (blokId: string) => ['panen', 'list', { blokId }] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    tenants: (page: number) => ['admin', 'tenants', page] as const,
    users: (page: number, filters?: object) => ['admin', 'users', page, filters] as const,
    paket: ['admin', 'paket'] as const,
    transaksi: (status: string, page: number) => ['admin', 'transaksi', status, page] as const,
    logs: (page: number) => ['admin', 'logs', page] as const,
  }
};
```
