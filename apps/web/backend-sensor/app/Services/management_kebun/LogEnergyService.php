<?php

namespace App\Services\management_kebun;

use App\Models\LogEnergy;

class LogEnergyService
{
    private const MAKS_CELAH_MENIT = 15;
    public function getRiwayatBySensor(string $sensorId, int $limit = 100)
    {
        return LogEnergy::where('sensor_id', $sensorId)
            ->orderByDesc('dicatat_pada')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }

    /**
     * Estimasi total kWh dari deretan pembacaan konsumsi_watt.
     * Pendekatan: tiap pembacaan dianggap mewakili daya rata-rata sampai
     * pembacaan berikutnya (untuk pembacaan terakhir, sampai waktu sekarang).
     * Ini estimasi kasar, bukan pengukuran presisi - cukup buat MVP.
     */
    public function getTotalKwhBySensor(string $sensorId): float
   {
       $readings = LogEnergy::where('sensor_id', $sensorId)
           ->orderBy('dicatat_pada', 'asc')
           ->get();

       if ($readings->isEmpty()) {
           return 0;
       }

       $totalKwh = 0;

       foreach ($readings as $i => $current) {
           $next = $readings[$i + 1] ?? null;
           $endTime = $next ? $next->dicatat_pada : now();

           // celah lebih lama dari batas dianggap perangkat offline, nggak dihitung penuh
           $detik = min($current->dicatat_pada->diffInSeconds($endTime), self::MAKS_CELAH_MENIT * 60);

           $totalKwh += ($current->konsumsi_watt * $detik / 3600) / 1000;
       }

       return round($totalKwh, 3);
   }
}