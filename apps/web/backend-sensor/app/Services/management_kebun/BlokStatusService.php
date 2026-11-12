<?php

namespace App\Services\management_kebun;

use App\Models\Blok;
use App\Models\NodeSensor;
use Carbon\Carbon;

class BlokStatusService
{
    public function getRingkasanBlok(string $blokId): array
    {
        return $this->susunRingkasan(NodeSensor::where('blok_id', $blokId)->get());
    }

    /**
     * Ringkasan SEMUA blok dalam satu kebun. Jumlah query tetap (2) berapa pun
     * jumlah blok, supaya web tidak perlu memanggil status-lampu satu per satu.
     *
     * @return array<int, array<string, mixed>> satu elemen per blok, memuat 'blok_id'
     */
    public function getRingkasanKebun(string $kebunId): array
    {
        $blokIds = Blok::where('kebun_id', $kebunId)->pluck('id_blok');
        $nodePerBlok = NodeSensor::whereIn('blok_id', $blokIds)->get()->groupBy('blok_id');

        return $blokIds
            ->map(fn ($blokId) => ['blok_id' => $blokId] + $this->susunRingkasan($nodePerBlok->get($blokId, collect())))
            ->values()
            ->all();
    }

    private function susunRingkasan(\Illuminate\Support\Collection $nodes): array
    {
        $batasDetik = (int) config('lampu.offline_setelah_detik', 90);
        $batasWaktu = Carbon::now()->subSeconds($batasDetik);

        $hasil = $nodes->map(function ($node) use ($batasWaktu) {
            $online = $node->terakhir_terlihat !== null
                && Carbon::parse($node->terakhir_terlihat)->greaterThanOrEqualTo($batasWaktu);

            // 3 keadaan untuk FE: online | offline (pernah terlihat, lewat batas) | belum_pernah_terlihat
            $status = $online
                ? 'online'
                : ($node->terakhir_terlihat === null ? 'belum_pernah_terlihat' : 'offline');

            // Satu node mengendalikan beberapa lampu; default 1 untuk node lama.
            $jumlahLampu = (int) ($node->jumlah_lampu ?? 1);
            $wattPerLampu = $node->watt_per_lampu !== null ? (float) $node->watt_per_lampu : null;

            return [
                'id_sensor'         => $node->id_sensor,
                'kode_perangkat'    => $node->kode_perangkat,
                'status_online'     => $online,
                'status'            => $status,
                'terakhir_terlihat' => $node->terakhir_terlihat,
                'jumlah_lampu'      => $jumlahLampu,
                'watt_per_lampu'    => $wattPerLampu,
                'watt_terpasang'    => $wattPerLampu !== null ? round($jumlahLampu * $wattPerLampu, 2) : null,
            ];
        });

        // Total watt hanya bila SEMUA node punya data watt; kalau tidak null
        // (jangan menampilkan angka yang kurang dari sebenarnya).
        $wattTerpasang = ($hasil->isEmpty() || $hasil->contains(fn (array $n) => $n['watt_per_lampu'] === null))
            ? null
            : round((float) $hasil->sum('watt_terpasang'), 2);

        // jumlah_lampu / jumlah_online / jumlah_offline kini dihitung dalam LAMPU
        // (dulu: jumlah node). Hitungan node ada di jumlah_node / node_online / node_offline.
        return [
            'jumlah_node'         => $nodes->count(),
            'node_online'         => $hasil->where('status_online', true)->count(),
            'node_offline'        => $hasil->where('status_online', false)->count(),
            'jumlah_lampu'        => (int) $hasil->sum('jumlah_lampu'),
            'jumlah_online'       => (int) $hasil->where('status_online', true)->sum('jumlah_lampu'),
            'jumlah_offline'      => (int) $hasil->where('status_online', false)->sum('jumlah_lampu'),
            'watt_terpasang'      => $wattTerpasang,
            'batas_offline_detik' => $batasDetik,
            'nodes'               => $hasil->values(),
        ];
    }
}