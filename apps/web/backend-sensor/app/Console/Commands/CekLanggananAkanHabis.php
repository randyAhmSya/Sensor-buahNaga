<?php

namespace App\Console\Commands;

use App\Models\LanggananTenant;
use App\Models\Notifikasi;
use Illuminate\Console\Command;

class CekLanggananAkanHabis extends Command
{
    protected $signature = 'langganan:cek-h3';
    protected $description = 'Bikin notifikasi buat tenant yang langganannya tersisa 1-3 hari lagi';

    public function handle(): void
    {
        $kandidat = LanggananTenant::whereNotNull('tanggal_aktif_terakhir')
            ->whereHas('tenant', fn ($q) => $q->where('is_aktif', true))
            ->get();

        $dibuat = 0;

        foreach ($kandidat as $langganan) {
            $sisaHari = $langganan->sisaHariAktual();

            if ($sisaHari < 1 || $sisaHari > 3) {
                continue;
            }

            $sudahAdaHariIni = Notifikasi::where('tenant_id', $langganan->tenant_id)
                ->where('tipe', 'langganan_akan_habis')
                ->whereDate('created_at', today())
                ->exists();

            if ($sudahAdaHariIni) {
                continue;
            }

            Notifikasi::create([
                'tenant_id' => $langganan->tenant_id,
                'tipe' => 'langganan_akan_habis',
                'judul' => 'Langganan akan habis',
                'pesan' => "Langganan kamu tersisa {$sisaHari} hari lagi. Perpanjang sekarang biar fitur kebun kamu nggak terkunci.",
                'data' => ['sisa_hari' => $sisaHari],
            ]);

            $dibuat++;
        }

        $this->info("Notifikasi dibuat: {$dibuat}");
    }
}