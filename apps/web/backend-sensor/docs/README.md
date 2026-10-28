# 🐉 AgroLight Developer Documentation Hub

Selamat datang di pusat dokumentasi teknis dan panduan integrasi sistem **AgroLight** (Sistem IoT Monitoring Sensor & Otomasi Penyinaran Perkebunan Buah Naga).

Dokumentasi ini disusun untuk memfasilitasi kolaborasi lintas tim antara Frontend Engineers (Web & Mobile), Backend Engineers, serta IoT/Hardware Engineers.

---

## 🧭 Pilih Jalur Dokumentasi

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin: 1.5rem 0;">

<div style="padding: 1.25rem; border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb; border-top: 4px solid #059669;">
  <h3 style="margin-top: 0; color: #065f46;">📘 Tim Frontend (Web & Mobile)</h3>
  <p style="font-size: 0.925rem; color: #4b5563;">
    Panduan integrasi API client, spesifikasi header global, skema autentikasi Bearer token Sanctum, kontrak I/O endpoint lengkap, tipe TypeScript siap pakai, dan pemetaan error code.
  </p>
  <a href="#/API_INTEGRATION_GUIDE" style="display: inline-block; padding: 6px 14px; background: #059669; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 0.875rem;">Buka API Integration Guide →</a>
</div>

<div style="padding: 1.25rem; border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb; border-top: 4px solid #3b82f6;">
  <h3 style="margin-top: 0; color: #1e40af;">🛠️ Tim Internal Backend & DevOps</h3>
  <p style="font-size: 0.925rem; color: #4b5563;">
    Peta arsitektur kode internal, breakdown teknis per-file (Routes, Controllers, Services, Models, Migrations), checklist variabel <code>.env</code>, mitigasi concurrency lock, dan integrasi Mosquitto MQTT.
  </p>
  <a href="#/BACKEND_CODEBASE_GUIDE" style="display: inline-block; padding: 6px 14px; background: #2563eb; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 0.875rem;">Buka Backend Codebase Guide →</a>
</div>

</div>

---

## ⚡ Ringkasan Fitur Inti Platform

1. **Multi-Tenancy & Data Privacy Isolation:**
   Setiap petani terisolasi ke dalam `tenant_id` masing-masing. Akses data oleh Super Admin wajib melalui protokol izin permohonan (*consent approval*) dari pemilik kebun.
2. **Siklus Langganan Fleksibel (Trial & Grace Period):**
   Mendukung uji coba gratis 7 hari, masa tenggang toleransi (2 hari), pembayaran manual transfer (verifikasi admin), dan pembayaran instan online via Midtrans Snap.
3. **Otomasi Penyinaran Fotoperiode:**
   Pengaturan jadwal nyala lampu buah naga tingkat kebun atau override per-tiang, proteksi anti-flicker dengan slider cooldown, dan kalkulasi dinamis **Auto-Dimming** berbasis intensitas lux lingkungan malam hari.
4. **Hardware Gateway Pairing & Mosquitto Isolation:**
   Otomasi penukaran kode pairing captive portal ESP32 menjadi kredensial permanen MQTT serta pemutakhiran file ACL broker Mosquitto secara programatis.
5. **Pelacakan Siklus Panen & Estimasi Bunga:**
   Rekalkulasi otomatis estimasi hari panen buah naga saat tanggal berbunga nyata tercatat oleh petani.

---

## 🚀 Cara Menjalankan Viewer Dokumentasi Secara Lokal

Dokumentasi ini ditenagai oleh **Docsify** sehingga dapat dibuka langsung di peramban tanpa proses kompilasi (*zero build*).

### Menggunakan Docsify CLI
```bash
npx docsify-cli serve ./docs
```
Akses di browser pada: `http://localhost:3000`

### Menggunakan Python HTTP Server (Alternatif)
```bash
python -m http.server 3000 -d ./docs
```

### Menggunakan Node.js `serve` / `http-server`
```bash
npx serve ./docs
```

---

> [!TIP]
> Gunakan tombol pencarian (Search) di pojok kiri atas sidebar atau tekan `Ctrl + /` untuk mencari endpoint, nama file, maupun kode fungsi secara instan.
