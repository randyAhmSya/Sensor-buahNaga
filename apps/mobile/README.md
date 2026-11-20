# AgroLight Mobile

Aplikasi Android untuk petani AgroLight: memindai QR node sensor, memantau data node, melihat riwayat auto-dimming, dan mengelola langganan. Dibuat dengan Expo SDK 57, React Native, NativeWind, dan TanStack Query.

## Menjalankan

```bash
npm install
npx expo start
```

Buka lewat Expo Go atau emulator Android.

## Konfigurasi

Salin `.env.example` menjadi `.env`.

| Variabel | Fungsi |
|---|---|
| `EXPO_PUBLIC_API_URL` | Alamat API backend, contoh `http://192.168.1.3:8080/api` |
| `EXPO_PUBLIC_FITUR_LANGGANAN` | `true` untuk menampilkan fitur langganan |

Perangkat fisik tidak bisa memakai `localhost`. Pakai alamat IP laptop di jaringan Wi-Fi yang sama dengan HP.

## Pengambilan data

- Interval polling dipusatkan di `src/constant/polling.ts`: node 10 detik, daftar dan grafik 30 detik, notifikasi 60 detik. Ubah angka di sana saja.
- Polling berhenti saat layar tidak fokus atau aplikasi di latar belakang.
- Setelah memindai QR, data node dan riwayat pemindaian di-invalidasi supaya langsung segar.
- Cache disimpan di AsyncStorage (maksimal 24 jam), dan layar yang penting memakai `refetchOnMount: "always"`.

## Membangun APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Profil `preview` di `eas.json` menghasilkan APK dan memakai `EXPO_PUBLIC_API_URL` dari bagian `env` profil itu. Ubah alamat tersebut sesuai server sebelum membangun. Selama alamatnya IP lokal, APK hanya berfungsi di jaringan Wi-Fi yang sama.

### Membagikan APK

APK yang dipasang manual (sideload) memicu peringatan "aplikasi tidak dikenali" dari Chrome, Google Drive, dan Play Protect. Itu normal untuk aplikasi di luar Play Store. Penguji cukup memilih "Install anyway" atau mengizinkan instalasi dari sumber tidak dikenal. Untuk distribusi yang lebih mulus, gunakan jalur uji internal Play Store atau akun distribusi terbatas.

## Pengujian

```bash
npx expo lint
```

Untuk produksi, gunakan HTTPS dan hapus pengecualian cleartext HTTP.