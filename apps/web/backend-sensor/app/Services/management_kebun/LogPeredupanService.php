<?php

namespace App\Services\management_kebun;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Riwayat auto-dimming untuk chart dashboard: kecerahan lampu (%) dan lux sekitar,
 * dirata-ratakan per bucket waktu supaya ribuan titik telemetri tidak dikirim mentah.
 */
class LogPeredupanService
{
    public const JAM_DEFAULT = 12;
    public const JAM_MAKS = 24;
    public const INTERVAL_DEFAULT_MENIT = 10;
    public const INTERVAL_MAKS_MENIT = 60;

    public function riwayat(string $sensorId, int $jam = self::JAM_DEFAULT, int $intervalMenit = self::INTERVAL_DEFAULT_MENIT): array
    {
        $jam = max(1, min($jam, self::JAM_MAKS));
        $intervalMenit = max(1, min($intervalMenit, self::INTERVAL_MAKS_MENIT));
        $detik = $intervalMenit * 60;

        $sampai = now();
        $dari = $sampai->copy()->subHours($jam);

        // $detik sudah dipastikan integer di atas, aman di-inline.
        // extract(epoch) pada kolom timestamp (tanpa zona) = detik "nominal" dari jam dinding
        // yang tersimpan, jadi bucket sejajar dengan jam dinding timezone aplikasi.
        $rows = DB::table('log_peredupans')
            ->selectRaw("floor(extract(epoch from dicatat_pada) / {$detik}) as bucket")
            ->selectRaw('avg(presentase_redup) as kecerahan')
            ->selectRaw('avg(nilai_lux) as lux')
            ->selectRaw('count(*) as jumlah_sampel')
            ->where('sensor_id', $sensorId)
            ->whereBetween('dicatat_pada', [$dari, $sampai])
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get();

        $zona = config('app.timezone');

        $titik = $rows->map(function ($row) use ($detik, $zona) {
            $jamDinding = gmdate('Y-m-d H:i:s', ((int) $row->bucket) * $detik);

            return [
                'waktu'            => Carbon::parse($jamDinding, $zona)->toIso8601String(),
                'kecerahan_persen' => round((float) $row->kecerahan, 2),
                'lux'              => round((float) $row->lux, 2),
                'jumlah_sampel'    => (int) $row->jumlah_sampel,
            ];
        })->values()->all();

        return [
            'sensor_id'      => $sensorId,
            'dari'           => $dari->toIso8601String(),
            'sampai'         => $sampai->toIso8601String(),
            'interval_menit' => $intervalMenit,
            'titik'          => $titik,
        ];
    }
}