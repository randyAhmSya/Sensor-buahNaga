<?php

namespace App\Services\management_kebun;

use App\Models\Blok;
use App\Models\JadwalLampu;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Ringkasan jadwal lampu per kebun: satu baris per blok/node beserta jadwal yang
 * BERLAKU untuk node itu dan dari mana asalnya (override node atau default kebun).
 *
 * Aturan resolusi sengaja sama dengan JadwalLampuService::resolveJadwalAktifUntukSensor:
 * override aktif milik node dulu, kalau tidak ada baru default aktif milik kebun.
 * Bedanya, di sini diambil sekaligus (2 query) supaya tidak N+1.
 */
class JadwalRingkasanService
{
    public const SUMBER_OVERRIDE = 'override';
    public const SUMBER_DEFAULT = 'default';
    public const SUMBER_BELUM_ADA = 'belum_ada';
    public const SUMBER_TANPA_NODE = 'tanpa_node';

    /**
     * @return array{default_kebun: ?JadwalLampu, node: LengthAwarePaginator}
     */
    public function ringkasanKebun(string $kebunId, int $perPage = 15): array
    {
        $default = JadwalLampu::where('kebun_id', $kebunId)
            ->where('status_aktif', true)
            ->first();

        $paginator = Blok::with('nodeSensor')
            ->where('kebun_id', $kebunId)
            ->orderBy('nama_blok')
            ->orderBy('id_blok')
            ->paginate($perPage);

        $sensorIds = $paginator->getCollection()
            ->map(fn (Blok $blok) => $blok->nodeSensor?->id_sensor)
            ->filter()
            ->values()
            ->all();

        $overrideBySensor = empty($sensorIds)
            ? collect()
            : JadwalLampu::whereIn('sensor_id', $sensorIds)
                ->where('status_aktif', true)
                ->get()
                ->keyBy('sensor_id');

        $paginator->through(fn (Blok $blok) => $this->barisNode($blok, $overrideBySensor, $default));

        return [
            'default_kebun' => $default,
            'node'          => $paginator,
        ];
    }

    private function barisNode(Blok $blok, $overrideBySensor, ?JadwalLampu $default): array
    {
        $node = $blok->nodeSensor;

        if (!$node) {
            return $this->baris($blok, null, self::SUMBER_TANPA_NODE, null);
        }

        $override = $overrideBySensor->get($node->id_sensor);
        if ($override) {
            return $this->baris($blok, $node, self::SUMBER_OVERRIDE, $override);
        }

        if ($default) {
            return $this->baris($blok, $node, self::SUMBER_DEFAULT, $default);
        }

        return $this->baris($blok, $node, self::SUMBER_BELUM_ADA, null);
    }

    private function baris(Blok $blok, $node, string $sumber, ?JadwalLampu $jadwal): array
    {
        return [
            'id_blok'        => $blok->id_blok,
            'nama_blok'      => $blok->nama_blok,
            'id_sensor'      => $node?->id_sensor,
            'kode_perangkat' => $node?->kode_perangkat,
            'status_koneksi' => $node?->status_koneksi,
            'sumber'         => $sumber,
            'jadwal'         => $jadwal,
        ];
    }
}