<?php

namespace App\Services\management_kebun;

use App\Models\NodeSensor;
use Carbon\Carbon;

class BlokStatusService
{
    public function getRingkasanBlok(string $blokId): array
    {
        $batasDetik = (int) config('lampu.offline_setelah_detik', 90);
        $batasWaktu = Carbon::now()->subSeconds($batasDetik);

        $nodes = NodeSensor::where('blok_id', $blokId)->get();

        $hasil = $nodes->map(function ($node) use ($batasWaktu) {
            $online = $node->terakhir_terlihat !== null
                && Carbon::parse($node->terakhir_terlihat)->greaterThanOrEqualTo($batasWaktu);

            // 3 keadaan untuk FE: online | offline (pernah terlihat, lewat batas) | belum_pernah_terlihat
            $status = $online
                ? 'online'
                : ($node->terakhir_terlihat === null ? 'belum_pernah_terlihat' : 'offline');

            return [
                'id_sensor'         => $node->id_sensor,
                'kode_perangkat'    => $node->kode_perangkat,
                'status_online'     => $online,
                'status'            => $status,
                'terakhir_terlihat' => $node->terakhir_terlihat,
            ];
        });

        return [
            'jumlah_lampu'        => $nodes->count(),
            'jumlah_online'       => $hasil->where('status_online', true)->count(),
            'jumlah_offline'      => $hasil->where('status_online', false)->count(),
            'batas_offline_detik' => $batasDetik,
            'nodes'               => $hasil->values(),
        ];
    }
}