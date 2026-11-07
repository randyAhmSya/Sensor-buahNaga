<?php

namespace App\Services\management_kebun;

use App\Models\JadwalLampu;
use App\Models\NodeSensor;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Ringkasan satu node untuk layar Detail Node: info perangkat, status online,
 * bacaan terakhir (lux, suhu), energi, kecerahan terakhir, dan jadwal yang berlaku
 * dalam SATU respons, supaya app tidak perlu 5 request terpisah.
 *
 * Semua "terakhir" diambil berdasarkan dicatat_pada TERBARU. Tiap blok membawa
 * flag `basi` (true bila lebih tua dari batas offline) supaya FE tidak menampilkan
 * angka lama seolah-olah real-time.
 *
 * Catatan kWh: estimasi. Tiap pembacaan dianggap mewakili daya sampai pembacaan
 * berikutnya, dengan batas celah (config lampu.energi_celah_maks_detik, default 600 detik)
 * supaya node yang mati tidak dihitung terus memakai daya terakhirnya.
 */
class NodeRingkasanService
{
    public const KWH_JAM_DEFAULT = 24;
    public const CELAH_MAKS_DETIK_DEFAULT = 900;

    public function __construct(protected JadwalLampuService $jadwalService) {}

    public function ringkasan(NodeSensor $node): array
    {
        $batasDetik = (int) config('lampu.offline_setelah_detik', 90);
        $sekarang = now();
        $batasWaktu = $sekarang->copy()->subSeconds($batasDetik);
        $sensorId = $node->id_sensor;

        $bacaan = $this->bacaanTerakhir($sensorId, $batasWaktu);
        $energi = $this->energi($sensorId, $sekarang, $batasWaktu);
        $dimming = $this->dimmingTerakhir($sensorId, $batasWaktu);

        return [
            'node'                => $this->infoNode($node, $batasWaktu),
            'bacaan_terakhir'     => $bacaan,
            'energi'              => $energi,
            'dimming_terakhir'    => $dimming,
            'jadwal'              => $this->jadwalBerlaku($node),
            'batas_offline_detik' => $batasDetik,
        ];
    }

    private function infoNode(NodeSensor $node, Carbon $batasWaktu): array
    {
        $terlihat = $this->keWaktu($node->terakhir_terlihat);
        $online = $terlihat !== null && $terlihat->greaterThanOrEqualTo($batasWaktu);
        $status = $online ? 'online' : ($terlihat === null ? 'belum_pernah_terlihat' : 'offline');

        $blok = $node->blok;
        $kebun = $blok?->kebun;
        $gateway = $node->gateway;

        return [
            'id_sensor'         => $node->id_sensor,
            'kode_perangkat'    => $node->kode_perangkat,
            'tipe_sensor'       => $node->tipe_sensor,
            'status'            => $status,
            'status_online'     => $online,
            'terakhir_terlihat' => $terlihat?->toIso8601String(),
            'blok'              => $blok ? [
                'id_blok'   => $blok->id_blok,
                'nama_blok' => $blok->nama_blok,
                'luas_area' => $blok->luas_area,
            ] : null,
            'kebun'             => $kebun ? [
                'id_kebun'   => $kebun->id_kebun,
                'nama_kebun' => $kebun->nama_kebun,
            ] : null,
            'gateway'           => $gateway ? [
                'id_gateway'     => $gateway->id_gateway,
                'kode_perangkat' => $gateway->kode_perangkat,
            ] : null,
            'kode_qr'           => $node->qr?->teks_kode_qr,
        ];
    }

    private function bacaanTerakhir(string $sensorId, Carbon $batasWaktu): ?array
    {
        $row = DB::table('read__sensors')
            ->where('sensor_id', $sensorId)
            ->orderByDesc('dicatat_pada')
            ->first(['nilai_lux', 'suhu', 'dicatat_pada']);

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

    private function energi(string $sensorId, Carbon $sekarang, Carbon $batasWaktu): array
    {
        $terakhir = DB::table('log_energies')
            ->where('sensor_id', $sensorId)
            ->orderByDesc('dicatat_pada')
            ->first(['konsumsi_watt', 'dicatat_pada']);

        $waktu = $terakhir ? $this->keWaktu($terakhir->dicatat_pada) : null;

        return [
            'watt_terakhir' => $terakhir ? (float) $terakhir->konsumsi_watt : null,
            'dicatat_pada'  => $waktu?->toIso8601String(),
            'basi'          => $terakhir === null || $waktu === null || $waktu->lessThan($batasWaktu),
            'kwh_24_jam'    => $this->kwhJamTerakhir($sensorId, $sekarang, self::KWH_JAM_DEFAULT),
        ];
    }

    /**
     * Estimasi kWh dalam N jam terakhir, dihitung di SQL (tanpa memuat semua baris).
     */
    private function kwhJamTerakhir(string $sensorId, Carbon $sekarang, int $jam): float
    {
        $cap = max(1, (int) config('lampu.energi_celah_maks_detik', self::CELAH_MAKS_DETIK_DEFAULT));
        $dari = $sekarang->copy()->subHours($jam);

        $sql = <<<'SQL'
SELECT COALESCE(SUM(
    konsumsi_watt * LEAST(
        EXTRACT(EPOCH FROM (COALESCE(next_at, CAST(? AS timestamp)) - dicatat_pada)),
        ?
    ) / 3600000.0
), 0) AS kwh
FROM (
    SELECT konsumsi_watt, dicatat_pada,
           LEAD(dicatat_pada) OVER (ORDER BY dicatat_pada) AS next_at
    FROM log_energies
    WHERE sensor_id = ? AND dicatat_pada >= ?
) t
SQL;

        $row = DB::selectOne($sql, [
            $sekarang->toDateTimeString(),
            $cap,
            $sensorId,
            $dari->toDateTimeString(),
        ]);

        return round((float) ($row->kwh ?? 0), 3);
    }

    private function dimmingTerakhir(string $sensorId, Carbon $batasWaktu): ?array
    {
        $row = DB::table('log_peredupans')
            ->where('sensor_id', $sensorId)
            ->orderByDesc('dicatat_pada')
            ->first(['presentase_redup', 'nilai_lux', 'fase_bulan', 'dicatat_pada']);

        if (!$row) {
            return null;
        }

        $waktu = $this->keWaktu($row->dicatat_pada);

        return [
            'kecerahan_persen' => round((float) $row->presentase_redup, 2),
            'nilai_lux'        => (float) $row->nilai_lux,
            'fase_bulan'       => $row->fase_bulan,
            'dicatat_pada'     => $waktu?->toIso8601String(),
            'basi'             => $waktu === null || $waktu->lessThan($batasWaktu),
        ];
    }

    /**
     * Jadwal yang berlaku untuk node: override node dulu, kalau tidak ada baru default kebun
     * (aturan sama dengan JadwalLampuService::resolveJadwalAktifUntukSensor).
     */
    private function jadwalBerlaku(NodeSensor $node): array
    {
        $override = JadwalLampu::where('sensor_id', $node->id_sensor)
            ->where('status_aktif', true)
            ->first();

        $jadwal = $override;
        $sumber = 'override';

        if (!$jadwal && $node->blok) {
            $jadwal = JadwalLampu::where('kebun_id', $node->blok->kebun_id)
                ->where('status_aktif', true)
                ->first();
            $sumber = 'default';
        }

        if (!$jadwal) {
            return [
                'sumber'                      => 'belum_ada',
                'sedang_dalam_jendela_nyala'  => false,
                'jadwal'                      => null,
            ];
        }

        return [
            'sumber'                     => $sumber,
            'sedang_dalam_jendela_nyala' => $this->jadwalService->sedangDalamJendelaNyala($jadwal),
            'jadwal'                     => $jadwal,
        ];
    }

    /** Waktu tersimpan (tanpa zona) dibaca sebagai zona aplikasi, sama dengan penulisnya (now()). */
    private function keWaktu(mixed $nilai): ?Carbon
    {
        if ($nilai === null || $nilai === '') {
            return null;
        }

        return Carbon::parse((string) $nilai, config('app.timezone'));
    }
}