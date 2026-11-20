<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

trait FileUploadTrait
{
    /** Lebar maksimal (px) dan kualitas WebP. Ubah di sini saja. */
    private const LEBAR_FOTO = 1280;   // foto kebun dan blok
    private const LEBAR_BUKTI = 1600;  // bukti transfer, teks harus tetap terbaca
    private const KUALITAS_WEBP = 80;

    /**
     * Mengunggah foto dengan struktur folder otomatis (berdasarkan Tahun/Bulan).
     * Foto diperkecil dan disimpan sebagai WebP bila hasilnya lebih ringan.
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

            // 3. Simpan foto baru (diperkecil ke WebP) dan kembalikan path-nya
            return $this->simpanGambar($file, $folderTerstruktur, 'public', self::LEBAR_FOTO);
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
        return "$syarat|image|mimes:jpeg,png,jpg,webp|max:2048|dimensions:max_width=4096,max_height=4096";
    }

    public function uploadPrivat($file, string $baseFolder, ?string $oldPath = null): ?string
    {
        if ($file) {
            $this->hapusFilePrivat($oldPath);

            $folderTerstruktur = $baseFolder . '/' . date('Y/m');

            return $this->simpanGambar($file, $folderTerstruktur, 'local', self::LEBAR_BUKTI);
        }

        return $oldPath;
    }

    public function hapusFilePrivat(?string $path): void
    {
        if ($path && Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }
    }

    /**
     * Simpan gambar sebagai WebP yang sudah diperkecil. Jika konversi gagal atau
     * hasilnya tidak lebih kecil dari aslinya, simpan file aslinya apa adanya
     * supaya unggahan tidak pernah hilang.
     */
    private function simpanGambar($file, string $folder, string $disk, int $lebarMaks): string
{
    $webp = $this->jadikanWebp($file, $lebarMaks);

    if ($webp === null) {
        Log::warning('Upload: konversi WebP gagal, file asli disimpan', [
            'mime' => $file->getMimeType(),
            'ukuran' => $file->getSize(),
            'gd_webp' => function_exists('imagewebp'),
        ]);
    } elseif (strlen($webp) >= $file->getSize()) {
        Log::info('Upload: WebP tidak lebih kecil, file asli disimpan', [
            'asli' => $file->getSize(),
            'webp' => strlen($webp),
        ]);
    } else {
        $path = $folder . '/' . Str::random(40) . '.webp';
        Storage::disk($disk)->put($path, $webp);

        return $path;
    }

    return $file->store($folder, $disk);
}

    /**
     * Perkecil (tanpa memperbesar) lalu encode ke WebP memakai GD.
     * Mengembalikan null jika GD tidak mendukung atau gambar gagal diproses.
     */
    private function jadikanWebp($file, int $lebarMaks): ?string
    {
        if (!function_exists('imagewebp') || !function_exists('imagecreatefromstring')) {
            return null;
        }

        $jalur = $file->getRealPath();
        $isi = $jalur ? @file_get_contents($jalur) : false;
        if ($isi === false) {
            return null;
        }

        $gambar = @imagecreatefromstring($isi);
        if (!$gambar) {
            return null;
        }

        // Foto HP menyimpan arah putar di EXIF; GD tidak memperhitungkannya.
        if ($file->getMimeType() === 'image/jpeg' && function_exists('exif_read_data')) {
            $exif = @exif_read_data($jalur);
            $sudut = [3 => 180, 6 => -90, 8 => 90][$exif['Orientation'] ?? 1] ?? 0;
            if ($sudut !== 0) {
                $diputar = imagerotate($gambar, $sudut, 0);
                if ($diputar) {
                    imagedestroy($gambar);
                    $gambar = $diputar;
                }
            }
        }

        if (imagesx($gambar) > $lebarMaks) {
            $kecil = imagescale($gambar, $lebarMaks, -1, IMG_BICUBIC);
            if ($kecil) {
                imagedestroy($gambar);
                $gambar = $kecil;
            }
        }
        imagepalettetotruecolor($gambar);
        imagealphablending($gambar, false);
        imagesavealpha($gambar, true);

        ob_start();
        $berhasil = imagewebp($gambar, null, self::KUALITAS_WEBP);
        $hasil = ob_get_clean();
        imagedestroy($gambar);

        return ($berhasil && $hasil !== '' && $hasil !== false) ? $hasil : null;
    }
}