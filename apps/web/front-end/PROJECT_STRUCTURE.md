# Project Structure: Sensor Buah Naga Frontend

Dokumentasi arsitektur direktori lengkap untuk aplikasi frontend monitoring sensor buah naga.

**Tech stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS v4, React Router v7, Zustand, Zod, React Hook Form, `lucide-react` (icons), `html5-qrcode`, `axios`.

---

## Tree Structure

```
front-end/
|-- .agents/                        # Konfigurasi AI agent (gitignored)
|   `-- rules/                      # Rules Antigravity (flat, no subfolder)
|       |-- 01-guardrail-plan.md
|       |-- 02-ui-taste-antislop.md
|       |-- 03-react-typescript.md
|       |-- 04-tanstack-query.md
|       `-- 05-verification-debug.md
|
|-- .antigravity/                   # Raw skill references (gitignored)
|   `-- raw-skills/
|       |-- tampilan/
|       |-- tanstack/
|       |-- techstact/
|       `-- verivikasi/
|
|-- public/                         # Static assets yang di-serve langsung
|
|-- src/
|   |-- App.tsx                     # Root komponen, mounts AppRoutes
|   |-- main.tsx                    # Entry point Vite, ReactDOM.createRoot
|   |-- index.css                   # Global CSS, Tailwind directives
|   |
|   |-- assets/                     # Aset statis yang di-bundle Vite
|   |   |-- hero.png
|   |   |-- icons/
|   |   |   `-- dragonfruit.svg
|   |   `-- images/
|   |       `-- logo.png
|   |
|   |-- components/                 # Komponen UI reusable lintas-fitur
|   |   |-- common/                 # Komponen generik non-domain
|   |   |   |-- BrandLogo.tsx
|   |   |   |-- PageLoadingSpinner.tsx
|   |   |   |-- ScrollToTop.tsx
|   |   |   `-- SectionContainer.tsx
|   |   |-- feedback/               # Komponen state feedback
|   |   |   |-- SkeletonLoader.tsx
|   |   |   `-- Toast.tsx
|   |   |-- form/                   # Komponen form primitif reusable
|   |   |   |-- Checkbox.tsx
|   |   |   |-- FormWrapper.tsx
|   |   |   |-- InputField.tsx
|   |   |   |-- SelectField.tsx
|   |   |   `-- TextareaField.tsx
|   |   |-- layout/                 # Wrapper layout untuk halaman form
|   |   |   `-- FormPageLayout.tsx
|   |   |-- qr/                     # Komponen QR scanner global
|   |   |   `-- QRScannerModal.tsx
|   |   `-- ui/                     # Primitive UI atoms (shadcn-style)
|   |       |-- Badge.tsx
|   |       |-- Button.tsx
|   |       |-- Card.tsx
|   |       |-- CustomSelect.tsx
|   |       |-- Modal.tsx
|   |       `-- StatusBadge.tsx
|   |
|   |-- config/                     # Konstanta konfigurasi global
|   |   `-- constants.ts            # USER_ROLES, API base URL, dll
|   |
|   |-- constants/                  # Konstanta domain yang lebih spesifik
|   |   `-- landing.constants.ts    # Data statis untuk halaman landing
|   |
|   |-- data/                       # Mock data untuk development / prototyping
|   |   |-- centralData.ts
|   |   |-- mockBlockDetail.ts
|   |   |-- mockFarms.ts
|   |   |-- mockHarvests.ts
|   |   |-- mockQRCodes.ts
|   |   |-- mockScheduleNodes.ts
|   |   |-- mockSchedules.ts
|   |   |-- mockSensors.ts
|   |   |-- mockTelemetry.ts
|   |   `-- mockUser.ts
|   |
|   |-- features/                   # Fitur-fitur aplikasi (Feature-Sliced Design)
|   |   |-- auth/                   # Autentikasi (login, register)
|   |   |-- blocks/                 # Manajemen blok kebun
|   |   |-- dashboard/              # Dashboard utama petani/admin
|   |   |-- estimasi-panen/         # Estimasi dan proyeksi panen
|   |   |-- farms/                  # Manajemen kebun (CRUD)
|   |   |-- harvests/               # Manajemen siklus panen
|   |   |-- landing/                # Halaman publik (marketing)
|   |   |-- manajemen-qr/           # Generator QR code
|   |   |-- monitoring-alat/        # Monitoring kesehatan device/gateway
|   |   |-- profile/                # Profil dan pengaturan user
|   |   |-- qrcodes/                # Manajemen QR code (tabel, CRUD)
|   |   |-- schedules/              # Jadwal pencahayaan LED
|   |   |-- sensors/                # Monitoring sensor real-time
|   |   `-- super-admin/            # Portal super admin (tenant, user, langganan)
|   |
|   |-- layouts/                    # Layout shell per peran pengguna
|   |   |-- AdminLayout/            # Layout admin sistem (jarang dipakai)
|   |   |-- DashboardLayout/        # Layout portal Farmer Admin (/admin/*)
|   |   |-- PetaniLayout/           # Layout portal Petani (/petani/*)
|   |   |-- PublicLayout/           # Layout halaman publik (/)
|   |   `-- SuperAdminLayout/       # Layout portal Super Admin (/super-admin/*)
|   |
|   |-- routes/                     # Konfigurasi routing aplikasi
|   |   |-- AppRoutes.tsx           # Definisi semua Route, lazy loading
|   |   `-- guards/
|   |       `-- RoleGuard.tsx       # Proteksi rute berdasarkan peran
|   |
|   |-- schemas/                    # Schema Zod global (lintas-fitur)
|   |   |-- authSchema.ts
|   |   |-- deviceSchema.ts
|   |   |-- nodeSensor.schema.ts
|   |   `-- qrSchema.ts
|   |
|   |-- services/                   # Lapisan API dan network calls
|   |   |-- api.ts                  # Konfigurasi instance axios
|   |   |-- authService.ts
|   |   |-- blockService.ts
|   |   |-- energyService.ts
|   |   |-- farmService.ts
|   |   |-- gatewayService.ts
|   |   |-- harvestService.ts
|   |   |-- nodeService.ts
|   |   |-- qrService.ts
|   |   |-- scheduleService.ts
|   |   |-- sensorService.ts
|   |   |-- telemetryService.ts
|   |   |-- tenantService.ts
|   |   `-- mock/                   # File JSON mock responses
|   |       |-- mockHarvest.json
|   |       |-- mockHealth.json
|   |       |-- mockQr.json
|   |       `-- mockTenant.json
|   |
|   |-- store/                      # Global state management (Zustand)
|   |   `-- useAuthStore.ts         # Auth state: user, token, role
|   |
|   |-- types/                      # TypeScript type definitions global
|   |   |-- api.types.ts
|   |   |-- auth.types.ts
|   |   |-- block.types.ts
|   |   |-- database.types.ts
|   |   |-- farm.ts / farm.types.ts
|   |   |-- gateway.types.ts
|   |   |-- index.ts                # Re-export barrel
|   |   |-- kebun.types.ts
|   |   |-- node.types.ts
|   |   |-- qr.types.ts
|   |   |-- sensor.types.ts
|   |   |-- telemetry.ts
|   |   |-- tenant.types.ts
|   |   `-- user.ts
|   |
|   `-- utils/                      # Fungsi helper / utility murni
|       |-- cn.ts                   # `cn()` = clsx + tailwind-merge
|       |-- formatters.ts           # Format tanggal, angka, satuan
|       |-- normalize.ts            # Normalisasi data dari API
|       `-- sanitize.ts             # Sanitasi input sebelum submit
|
|-- index.html                      # HTML template Vite
|-- vite.config.ts                  # Konfigurasi Vite + alias `@/`
|-- tsconfig.json                   # TypeScript config root
|-- tsconfig.app.json               # TS config untuk source app
|-- tsconfig.node.json              # TS config untuk Vite config file
|-- .oxlintrc.json                  # Konfigurasi OXLint (linter)
|-- .env                            # Environment variables (gitignored)
|-- .gitignore
`-- package.json
```

---

## Rincian Folder dan File Kunci

### `src/features/` (Inti Arsitektur)

Aplikasi menggunakan arsitektur **Feature-Sliced** di mana setiap fitur adalah modul mandiri dengan struktur internal yang konsisten:

```
features/<nama-fitur>/
  |-- components/   # Komponen UI spesifik fitur ini
  |-- hooks/        # Custom hooks (data fetching, form logic)
  |-- pages/        # Komponen halaman yang di-mount di AppRoutes
  |-- schemas/      # Zod schemas untuk validasi form fitur ini
  |-- types/        # TypeScript types spesifik fitur ini
  `-- data/         # Mock data lokal fitur (opsional, jika ada)
```

| Fitur | Path | Deskripsi |
|-------|------|-----------|
| `auth` | `src/features/auth/` | Login dan register. Berisi form validation dengan Zod, hooks `useLoginForm` dan `useRegisterForm`. |
| `blocks` | `src/features/blocks/` | CRUD blok kebun. Komponen dibagi dalam sub-subfolder: `cards/`, `detail/`, `form/`, `tables/`. Ini fitur terbesar dengan banyak sub-komponen. |
| `dashboard` | `src/features/dashboard/` | Dashboard ringkasan farmer admin. Berisi metric cards, activity table, dan widget panen. |
| `estimasi-panen` | `src/features/estimasi-panen/` | Halaman estimasi panen dengan chart akumulasi lux dan progress ring. |
| `farms` | `src/features/farms/` | CRUD kebun. Hooks: `useFarms`, `useFarmForm`, `useFarmFilter`, `useCreateFarmPage`, `useEditFarmPage`. |
| `harvests` | `src/features/harvests/` | Manajemen siklus panen: tabel, modal create/edit/delete, filter bar. |
| `landing` | `src/features/landing/` | Halaman publik marketing: hero, features, pricing, how-it-works, about. |
| `manajemen-qr` | `src/features/manajemen-qr/` | Generator QR code dengan preview dan print layout. |
| `monitoring-alat` | `src/features/monitoring-alat/` | Monitoring kesehatan device/gateway: anomaly table, telemetry card, health badge. |
| `profile` | `src/features/profile/` | Halaman profil user: avatar, info, security section, tenant info. |
| `qrcodes` | `src/features/qrcodes/` | Manajemen QR code lengkap: tabel, generate, scan, delete modal. |
| `schedules` | `src/features/schedules/` | Jadwal pencahayaan LED: tabel aktif, form CRUD, dimming bar chart dan log table. |
| `sensors` | `src/features/sensors/` | Monitoring sensor real-time: node card, sparkline, summary cards, gateway pairing. |
| `super-admin` | `src/features/super-admin/` | Portal super admin: manajemen tenant, user, subscription, access request. |

---

### `src/layouts/` (Shell Per Peran)

Setiap layout adalah shell navigasi yang di-compose dengan `<Outlet />` dari React Router.

| Layout | Route Prefix | Komponen Utama |
|--------|-------------|----------------|
| `PublicLayout` | `/` | `PublicNavbar`, `PublicFooter` |
| `DashboardLayout` | `/admin/*` | `DashboardSidebar`, `DashboardTopBar` |
| `PetaniLayout` | `/petani/*` | `PetaniSidebar` (simplified) |
| `SuperAdminLayout` | `/super-admin/*` | `SuperAdminSidebar`, `SuperAdminTopBar` |
| `AdminLayout` | (reserved) | `AdminSidebar` |

---

### `src/services/` (Lapisan API)

Semua network calls dilakukan di sini. Komponen dan query hooks TIDAK boleh memanggil `axios` atau `fetch` langsung.

- `api.ts`: Instance axios dengan baseURL dari `.env`, interceptors untuk auth token.
- `*Service.ts`: Fungsi async per domain (misal: `farmService.ts` berisi `getFarms()`, `createFarm()`, dll).
- `mock/`: File JSON untuk response mock selama development.

---

### `src/store/` (Global State)

- `useAuthStore.ts`: Zustand store untuk state autentikasi (user object, access token, peran). Dipakai oleh `RoleGuard` dan service layer untuk inject Authorization header.

---

### `src/types/` (TypeScript Types Global)

Types yang digunakan lintas lebih dari satu fitur disimpan di sini. Types yang hanya digunakan dalam satu fitur disimpan di `src/features/<fitur>/types/`.

---

### `src/components/` (UI Reusable Lintas Fitur)

| Subfolder | Isi | Kapan Dipakai |
|-----------|-----|---------------|
| `common/` | `BrandLogo`, `ScrollToTop`, `SectionContainer`, `PageLoadingSpinner` | Komponen generik tanpa business logic domain |
| `feedback/` | `SkeletonLoader`, `Toast` | Loading state dan notifikasi transient |
| `form/` | `InputField`, `SelectField`, `Checkbox`, `TextareaField`, `FormWrapper` | Form primitif yang di-compose di feature forms |
| `layout/` | `FormPageLayout` | Wrapper layout untuk halaman dengan form panjang |
| `qr/` | `QRScannerModal` | Modal scanner QR yang dipakai dari beberapa fitur |
| `ui/` | `Button`, `Card`, `Badge`, `Modal`, `StatusBadge`, `CustomSelect` | Atom UI primitif (mirip shadcn/ui) |

---

### `src/routes/` (Routing)

- `AppRoutes.tsx`: Mendefinisikan semua `<Route>` dengan lazy loading via `React.lazy()`. Setiap halaman di-bundle secara terpisah untuk optimasi code splitting.
- `guards/RoleGuard.tsx`: HOC yang cek `useAuthStore` dan redirect jika role tidak sesuai.

**Pola URL yang ada:**

| Prefix | Peran | Contoh Route |
|--------|-------|-------------|
| `/` | Publik (semua) | `/`, `/features`, `/pricing` |
| `/login`, `/register` | Guest | |
| `/admin/*` | `ADMIN_KEBUN` | `/admin/farms`, `/admin/farms/:id` |
| `/super-admin/*` | `SUPER_ADMIN` | `/super-admin/tenants` |
| `/petani/*` | `PETANI` atau `ADMIN_KEBUN` | `/petani/estimasi` |

---

## Konvensi Penempatan File

### Komponen UI Baru

**Jika komponen hanya dipakai dalam satu fitur:**
```
src/features/<nama-fitur>/components/<NamaKomponen>.tsx
```
Contoh: Komponen card sensor baru untuk fitur `sensors`:
```
src/features/sensors/components/SensorBatteryCard.tsx
```

**Jika komponen dipakai di lebih dari satu fitur:**
```
src/components/ui/<NamaKomponen>.tsx          # Untuk atom primitif (Button, Badge, dll)
src/components/common/<NamaKomponen>.tsx      # Untuk komponen generik non-primitive
src/components/feedback/<NamaKomponen>.tsx    # Untuk skeleton, toast, error state
src/components/form/<NamaKomponen>.tsx        # Untuk input primitif form
```

---

### Custom Hook atau State Baru

**Hook data fetching (TanStack Query) spesifik fitur:**
```
src/features/<nama-fitur>/hooks/use<NamaHook>.ts
```
Contoh:
```
src/features/sensors/hooks/useSensorHistory.ts
```

**Hook form logic spesifik fitur:**
```
src/features/<nama-fitur>/hooks/use<NamaHook>Form.ts
```

**Global state baru (Zustand):**
```
src/store/use<NamaStore>.ts
```
Contoh: jika perlu store notifikasi global:
```
src/store/useNotificationStore.ts
```

---

### Integrasi API atau Query Baru

**1. Tambahkan fungsi ke service yang sesuai:**
```
src/services/<domain>Service.ts
```
Jika belum ada service untuk domain baru:
```
src/services/<domainBaru>Service.ts
```

**2. Definisikan types di:**
```
src/features/<nama-fitur>/types/<namaFitur>.types.ts   # Jika hanya 1 fitur
src/types/<domain>.types.ts                            # Jika lintas fitur
```

**3. Definisikan Zod schema di:**
```
src/features/<nama-fitur>/schemas/<namaFitur>.schema.ts
```

**4. Buat hook query di fiturnya:**
```
src/features/<nama-fitur>/hooks/use<Entity>.ts
```

---

### Halaman atau Route Baru

**1. Buat file page di feature yang sesuai:**
```
src/features/<nama-fitur>/pages/<NamaPage>.tsx
```

**2. Daftarkan lazy import di AppRoutes:**
```tsx
// src/routes/AppRoutes.tsx
const NamaPage = lazy(() =>
  import('@/features/<nama-fitur>/pages/NamaPage').then((m) => ({
    default: m.NamaPage,
  }))
)
```

**3. Tambahkan `<Route>` di dalam layout group yang sesuai:**
- Halaman publik: dalam `<Route element={<PublicLayout />}>`
- Halaman farmer admin: dalam `<Route path="/admin" ...>`
- Halaman super admin: dalam `<Route path="/super-admin" ...>`
- Halaman petani: dalam `<Route path="/petani" ...>`

**4. Jika perlu layout baru (peran baru):**
```
src/layouts/<NamaRole>Layout/
  |-- <NamaRole>Layout.tsx
  `-- <NamaRole>Sidebar.tsx
```

---

## Catatan Penting

- **Path alias `@/`** dipetakan ke `src/` via `vite.config.ts`. Selalu gunakan `@/` (bukan relative paths `../../`) untuk import lintas folder.
- **Mock data** di `src/data/` adalah data statis untuk development. Data di `src/features/<fitur>/data/` adalah mock data yang lebih spesifik per fitur. Keduanya harus diganti dengan service calls nyata sebelum production.
- **Duplikasi types** ditemukan antara `src/types/farm.ts` dan `src/types/farm.types.ts`. Saat menambahkan type baru di domain farm, periksa keduanya dan konsolidasikan ke `farm.types.ts`.
- **Schema Zod duplikasi** ditemukan: `src/schemas/nodeSensor.schema.ts` dan `src/features/sensors/schemas/nodeSensor.schema.ts`. Untuk schemas yang hanya dipakai dalam satu fitur, letakkan di dalam fitur tersebut.
