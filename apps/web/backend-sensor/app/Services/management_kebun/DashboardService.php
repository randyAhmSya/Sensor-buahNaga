<?php

namespace App\Services\management_kebun;

use App\Models\Blok;
use App\Models\JadwalLampu;
use App\Models\Kebun;
use App\Models\NodeSensor;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Data dashboard satu kebun dalam SATU respons: blok, node + status online,
 * siklus panen berjalan, dan jadwal lampu yang berlaku per blok.
 *
 * Tujuannya mengganti belasan request terpisah (blok, node, siklus-panen per blok,
 * status-lampu per blok, jadwal-lampu) dengan satu request. Jumlah query tetap
 * (tidak bertambah seiring jumlah blok): blok, node, siklus, jadwal default, override.
 *
 * Status online/offline dihitung saat dibaca dari terakhir_terlihat, aturan yang
 * sama dengan BlokStatusService (batas config('lampu.offline_setelah_detik')).
 */
class DashboardService
{
    public const STATUS_SIKLUS_BERJALAN = 'BERJALAN';

    public function ringkasanKebun(Kebun $kebun): array
    {
        $batasDetik = (int) config('lampu.offline_setelah_detik', 90);
        $batasWaktu = Carbon::now()->subSeconds($batasDetik);

        $bloks = Blok::where('kebun_id', $kebun->id_kebun)
            ->orderBy('nama_blok')
            ->orderBy('id_blok')
            ->get();

        $blokIds = $bloks->pluck('id_blok')->all();

        $nodePerBlok   = $this->ambilNodePerBlok($blokIds);
        $siklusPerBlok = $this->ambilSiklusBerjalanPerBlok($blokIds);

        $sensorIds = $nodePerBlok->flatten(1)->pluck('id_sensor')->all();
        $bacaanPerSensor = $this->ambilBacaanTerakhirPerSensor($sensorIds);

        $defaultKebun = JadwalLampu::where('kebun_id', $kebun->id_kebun)
            ->where('status_aktif', true)
            ->first();
        $overrideBySensor = empty($sensorIds)
            ? collect()
            : JadwalLampu::whereIn('sensor_id', $sensorIds)
                ->where('status_aktif', true)
                ->get()
                ->keyBy('sensor_id');

        $hitung = ['online' => 0, 'offline' => 0, 'belum_pernah_terlihat' => 0];

        $daftarBlok = $bloks->map(function (Blok $blok) use (
            $nodePerBlok, $siklusPerBlok, $overrideBySensor, $defaultKebun, $batasWaktu, $bacaanPerSensor, &$hitung
        ) {
            $nodes = ($nodePerBlok->get($blok->id_blok) ?? collect())
                ->map(fn (NodeSensor $node) => $this->formatNode(
                    $node,
                    $batasWaktu,
                    $this->formatBacaan($bacaanPerSensor->get($node->id_sensor), $batasWaktu)
                ))
                ->values();

            foreach ($nodes as $node) {
                $hitung[$node['status']]++;
            }

            $sensorId = $nodes->first()['id_sensor'] ?? null;

            return [
                'id_blok'      => $blok->id_blok,
                'nama_blok'    => $blok->nama_blok,
                'luas_area'    => $blok->luas_area,
                'url_foto'     => $blok->url_foto,
                'jumlah_node'  => $nodes->count(),
                'node'         => $nodes,
                'siklus_aktif' => $siklusPerBlok->get($blok->id_blok),
                'jadwal'       => $this->jadwalBerlaku($sensorId, $overrideBySensor, $defaultKebun),
            ];
        })->values();

        return [
            'kebun' => [
                'id_kebun'     => $kebun->id_kebun,
                'nama_kebun'   => $kebun->nama_kebun,
                'lokasi_kebun' => $kebun->lokasi_kebun,
                'status_kebun' => $kebun->status_kebun,
            ],
            'ringkasan' => [
                'jumlah_blok'           => $daftarBlok->count(),
                'jumlah_node'           => $daftarBlok->sum('jumlah_node'),
                'node_online'           => $hitung['online'],
                'node_offline'          => $hitung['offline'],
                'node_belum_terlihat'   => $hitung['belum_pernah_terlihat'],
                'siklus_berjalan'       => $siklusPerBlok->count(),
                'batas_offline_detik'   => $batasDetik,
                'bacaan_terbaru'        => $this->bacaanTerbaruKebun($daftarBlok),
            ],
            'jadwal_default_kebun' => $defaultKebun,
            'blok'                 => $daftarBlok,
        ];
    }

    /** @return Collection<string, Collection<int, NodeSensor>> dikelompokkan per blok_id */
    private function ambilNodePerBlok(array $blokIds): Collection
    {
        if (empty($blokIds)) {
            return collect();
        }

        return NodeSensor::whereIn('blok_id', $blokIds)->get()->groupBy('blok_id');
    }

    /**
     * Siklus BERJALAN terbaru per blok. Pakai query builder langsung agar tidak
     * bergantung pada model/service siklus; kolom sesuai migration siklus_panens.
     *
     * @return Collection<string, array>
     */
    private function ambilSiklusBerjalanPerBlok(array $blokIds): Collection
    {
        if (empty($blokIds)) {
            return collect();
        }

        return DB::table('siklus_panens')
            ->whereIn('block_id', $blokIds)
            ->where('status_siklus', self::STATUS_SIKLUS_BERJALAN)
            ->orderByDesc('tanggal_penyinaran')
            ->get()
            ->groupBy('block_id')
            ->map(function (Collection $baris) {
                $s = $baris->first();

                return [
                    'id_siklus_panen'                 => $s->id_siklus_panen,
                    'status_siklus'                   => $s->status_siklus,
                    'tanggal_penyinaran'              => $s->tanggal_penyinaran,
                    'target_hari_berbunga'            => $s->target_hari_berbunga,
                    'tanggal_berbunga_aktual'         => $s->tanggal_berbunga_aktual,
                    'target_hari_panen_setelah_bunga' => $s->target_hari_panen_setelah_bunga,
                    'estimasi_tanggal_panen'          => $s->estimasi_tanggal_panen,
                ];
            });
    }

    private function formatNode(NodeSensor $node, Carbon $batasWaktu, ?array $bacaan = null): array
    {
        $terlihat = $this->keWaktu($node->terakhir_terlihat);
        $online = $terlihat !== null && $terlihat->greaterThanOrEqualTo($batasWaktu);

        $status = $online
            ? 'online'
            : ($terlihat === null ? 'belum_pernah_terlihat' : 'offline');

        return [
            'id_sensor'         => $node->id_sensor,
            'kode_perangkat'    => $node->kode_perangkat,
            'status'            => $status,
            'status_online'     => $online,
            'terakhir_terlihat' => $terlihat?->toIso8601String(),
            'bacaan_terakhir'   => $bacaan,
        ];
    }

    /**
     * Bacaan terakhir tiap node dalam SATU query (DISTINCT ON), memanfaatkan indeks
     * (sensor_id, dicatat_pada). Jumlah query tetap berapa pun jumlah node.
     *
     * @return Collection<string, object>
     */
    private function ambilBacaanTerakhirPerSensor(array $sensorIds): Collection
    {
        if (empty($sensorIds)) {
            return collect();
        }

        return DB::table('read__sensors')
            ->selectRaw('DISTINCT ON (sensor_id) sensor_id, nilai_lux, suhu, dicatat_pada')
            ->whereIn('sensor_id', $sensorIds)
            ->orderBy('sensor_id')
            ->orderByDesc('dicatat_pada')
            ->get()
            ->keyBy('sensor_id');
    }

    private function formatBacaan(?object $row, Carbon $batasWaktu): ?array
    {
        if (!$row) {
            return null;
        }

        $waktu = $this->keWaktu($row->dicatat_pada);

        return [
            'nilai_lux'    => $row->nilai_lux !== null ? (float) $row->nilai_lux : null,
            'suhu'         => $row->suhu !== null ? (float) $row->suhu : null,
            'dicatat_pada' => $waktu?->toIso8601String(),
            'basi'         => $waktu === null || $waktu->lessThan($batasWaktu),
        ];
    }

    /** Bacaan paling baru di antara semua node kebun (untuk banner Home), atau null. */
    private function bacaanTerbaruKebun(Collection $daftarBlok): ?array
    {
        $terbaru = null;

        foreach ($daftarBlok as $blok) {
            foreach ($blok['node'] as $node) {
                $b = $node['bacaan_terakhir'];
                if ($b === null || $b['dicatat_pada'] === null) {
                    continue;
                }
                if ($terbaru === null || $b['dicatat_pada'] > $terbaru['dicatat_pada']) {
                    $terbaru = $b + [
                        'id_sensor'      => $node['id_sensor'],
                        'kode_perangkat' => $node['kode_perangkat'],
                    ];
                }
            }
        }

        return $terbaru;
    }

    /** Waktu tersimpan (tanpa zona) dibaca sebagai zona aplikasi, sama dengan penulisnya (now()). */
    private function keWaktu(mixed $nilai): ?Carbon
    {
        if ($nilai === null || $nilai === '') {
            return null;
        }

        return Carbon::parse((string) $nilai, config('app.timezone'));
    }

    /** Override node dulu, kalau tidak ada baru default kebun (sama dengan resolveJadwalAktifUntukSensor). */
    private function jadwalBerlaku(?string $sensorId, Collection $overrideBySensor, ?JadwalLampu $defaultKebun): array
    {
        if ($sensorId === null) {
            return ['sumber' => JadwalRingkasanService::SUMBER_TANPA_NODE, 'jadwal' => null];
        }

        $override = $overrideBySensor->get($sensorId);
        if ($override) {
            return ['sumber' => JadwalRingkasanService::SUMBER_OVERRIDE, 'jadwal' => $override];
        }

        if ($defaultKebun) {
            return ['sumber' => JadwalRingkasanService::SUMBER_DEFAULT, 'jadwal' => $defaultKebun];
        }

        return ['sumber' => JadwalRingkasanService::SUMBER_BELUM_ADA, 'jadwal' => null];
    }
}