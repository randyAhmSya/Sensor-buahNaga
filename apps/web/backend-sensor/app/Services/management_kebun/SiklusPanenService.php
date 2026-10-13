<?php

namespace App\Services\management_kebun;

use App\Models\SiklusPanen;
use Carbon\Carbon;

class SiklusPanenService
{
    public function getAllSiklusByBlok(string $blokId)
    {
        return SiklusPanen::where('block_id', $blokId)->orderByDesc('tanggal_penyinaran')->get();
    }

    public function getSiklusById(string $id)
    {
        return SiklusPanen::find($id);
    }

    public function createSiklus(array $data)
    {
        if (empty($data['target_hari_panen_setelah_bunga'])) {
            $data['target_hari_panen_setelah_bunga'] = 50; // rata-rata umum bunga mekar -> siap panen
        }

        // estimasi kasar cuma bisa dihitung kalau target_hari_berbunga udah diisi
        if (!empty($data['tanggal_penyinaran']) && !empty($data['target_hari_berbunga'])) {
            $data['estimasi_tanggal_panen'] = Carbon::parse($data['tanggal_penyinaran'])
                ->addDays((int) $data['target_hari_berbunga'])
                ->addDays((int) $data['target_hari_panen_setelah_bunga']);
        }

        return SiklusPanen::create($data);
    }

    public function updateSiklus(SiklusPanen $siklus, array $data)
    {
        // begitu tanggal berbunga aktual dicatat, estimasi dihitung ulang jadi lebih akurat
        // (pakai tanggal beneran, bukan target/rencana lagi)
        if (!empty($data['tanggal_berbunga_aktual'])) {
            $hariKePanen = $data['target_hari_panen_setelah_bunga'] ?? $siklus->target_hari_panen_setelah_bunga ?? 50;

            $data['estimasi_tanggal_panen'] = Carbon::parse($data['tanggal_berbunga_aktual'])
                ->addDays((int) $hariKePanen);
        }

        // kalau tanggal_panen dicatat, otomatis tandain siklus selesai
        if (!empty($data['tanggal_panen']) && empty($data['status_siklus'])) {
            $data['status_siklus'] = 'SELESAI';
        }

        $siklus->update($data);
        return $siklus;
    }

    public function deleteSiklus(SiklusPanen $siklus)
    {
        $siklus->delete();
    }
}
