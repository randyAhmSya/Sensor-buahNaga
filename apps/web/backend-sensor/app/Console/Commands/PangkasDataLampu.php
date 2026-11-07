<?php

namespace App\Console\Commands;

use App\Services\management_kebun\RetensiDataService;
use Illuminate\Console\Command;

class PangkasDataLampu extends Command
{
    protected $signature = 'lampu:pangkas-data
                            {--dry-run : Hanya tampilkan jumlah yang akan diproses, tanpa menulis atau menghapus}';

    protected $description = 'Rangkum lalu hapus data sensor/energi mentah yang melewati masa retensi (lihat config/lampu.php)';

    public function handle(RetensiDataService $service): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info($dryRun ? 'Mode dry-run: tidak ada data yang diubah.' : 'Memangkas data lama...');

        $hasil = $service->jalankan($dryRun);

        $this->table(
            ['Data', 'Batas (zona aplikasi)', 'Ringkasan harian ' . ($dryRun ? '(akan dibuat)' : 'baru'), $dryRun ? 'Baris (akan dihapus)' : 'Baris dihapus'],
            collect($hasil)->map(fn (array $r, string $nama) => [$nama, $r['batas'], $r['ringkasan_baru'], $r['baris']])->values()->all()
        );

        return self::SUCCESS;
    }
}
