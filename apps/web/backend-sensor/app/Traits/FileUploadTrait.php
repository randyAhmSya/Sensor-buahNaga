<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait FileUploadTrait
{
    /**
     * Mengunggah foto dengan struktur folder otomatis (berdasarkan Tahun/Bulan).
     *
     * @param \Illuminate\Http\UploadedFile|null $file File gambar dari request
     * @param string $baseFolder Nama folder utama (misal: 'foto_blok', 'profil_user')
     * @param string|null $oldPath Path foto lama di database (untuk dihapus otomatis)
     * @return string|null Mengembalikan path foto yang baru, atau path lama jika tidak ada upload
     */
    public function uploadFoto($file, string $baseFolder, ?string $oldPath = null): ?string
    {
        if ($file) {
            // 1. Hapus foto lama jika ada
            $this->hapusFoto($oldPath);

            // 2. Buat struktur folder rapi otomatis (Contoh: "foto_blok/2026/09")
            $folderTerstruktur = $baseFolder . '/' . date('Y/m');

            // 3. Simpan foto baru dan kembalikan path-nya
            return $file->store($folderTerstruktur, 'public');
        }

        // Kembalikan path lama jika user tidak mengunggah gambar baru saat update
        return $oldPath;
    }

    /**
     * Menghapus fisik foto dari penyimpanan lokal/server.
     */
    public function hapusFoto(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Kumpulan aturan validasi yang bisa dipakai ulang (Reusable Validation).
     */
    public function aturanValidasiFoto(bool $wajib = false): string
    {
        $syarat = $wajib ? 'required' : 'nullable';

        // Membatasi hanya gambar murni, maksimal 2MB
        return "$syarat|image|mimes:jpeg,png,jpg,webp|max:2048";
    }

    public function uploadPrivat($file, string $baseFolder, ?string $oldPath = null): ?string
    {
    if ($file) {
        $this->hapusFilePrivat($oldPath);

        $folderTerstruktur = $baseFolder . '/' . date('Y/m');

        return $file->store($folderTerstruktur, 'local');
    }

    return $oldPath;
    }


    public function hapusFilePrivat(?string $path): void
    {
        if ($path && Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }
    }
}

