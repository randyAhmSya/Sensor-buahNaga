<?php

namespace App\Services\management_kebun;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Menjaga ukuran database: merangkum lalu menghapus data mentah yang sudah lewat masa retensi.
 *
 *  - read__sensors, log_energies : dirangkum per hari per node (tabel ringkasan_*_harian)
 *    SEBELUM baris mentahnya dihapus. Jika perangkuman gagal, penghapusan tidak dijalankan.
 *  - log_peredupans              : hanya dihapus (volumenya kecil, retensi lebih lama).
 *
 * Batas hapus selalu awal HARI (zona config('lampu.zona_ringkasan')), jadi tidak ada hari
 * yang terpotong separuh. Retensi minimal 7 hari sebagai pengaman salah konfigurasi
 * (mis. nilai 0 yang akan menghapus semuanya) dan agar chart 7 hari tetap utuh.
 *
 * Khusus PostgreSQL (memakai AT TIME ZONE dan ctid).
 */
class RetensiDataService
{
    public const MINIMUM_HARI = 7;
    public const KELOMPOK_MINIMUM = 100;

    private const TABEL_TELEMETRI = 'read__sensors';
    private const TABEL_ENERGI = 'log_energies';
    private const TABEL_PEREDUPAN = 'log_peredupans';

    /**
     * @return array<string, array{batas: string, ringkasan_baru: int, baris: int}>
     */
    public function jalankan(bool $dryRun = false): array
    {
        $kelompok = max(self::KELOMPOK_MINIMUM, (int) config('lampu.retensi_ukuran_kelompok', 10000));

        $batasTelemetri = $this->batas('retensi_telemetri_hari', 30);
        $batasEnergi = $this->batas('retensi_energi_hari', 30);
        $batasPeredupan = $this->batas('retensi_peredupan_hari', 365);

        $hasil = [
            'telemetri' => $this->prosesTabel(
                self::TABEL_TELEMETRI, $batasTelemetri, $kelompok, $dryRun,
                fn (string $b) => $this->rangkumTelemetri($b),
                fn (string $b) => $this->hitungKelompokHari(self::TABEL_TELEMETRI, $b),
            ),
            'energi' => $this->prosesTabel(
                self::TABEL_ENERGI, $batasEnergi, $kelompok, $dryRun,
                fn (string $b) => $this->rangkumEnergi($b),
                fn (string $b) => $this->hitungKelompokHari(self::TABEL_ENERGI, $b),
            ),
            'peredupan' => $this->prosesTabel(
                self::TABEL_PEREDUPAN, $batasPeredupan, $kelompok, $dryRun,
                null,
                null,
            ),
        ];

        if (!$dryRun) {
            Log::info('Retensi data lampu selesai', $hasil);
        }

        return $hasil;
    }

    /**
     * Total kWh dari ringkasan harian (data yang mentahnya sudah dihapus).
     * Tambahkan ke total dari baris mentah yang masih ada; keduanya tidak tumpang tindih
     * karena ringkasan hanya dibuat untuk hari-hari SEBELUM batas hapus.
     */
    public function kwhRingkasan(string $sensorId, ?string $dariTanggal = null, ?string $sampaiTanggal = null): float
    {
        $q = DB::table('ringkasan_energi_harian')->where('sensor_id', $sensorId);

        if ($dariTanggal !== null) {
            $q->where('tanggal', '>=', $dariTanggal);
        }
        if ($sampaiTanggal !== null) {
            $q->where('tanggal', '<=', $sampaiTanggal);
        }

        return round((float) $q->sum('kwh'), 3);
    }

    // ------------------------------------------------------------------

    private function prosesTabel(
        string $tabel,
        string $batas,
        int $kelompok,
        bool $dryRun,
        ?callable $rangkum,
        ?callable $hitungRingkasan,
    ): array {
        if ($dryRun) {
            return [
                'batas'          => $batas,
                'ringkasan_baru' => $hitungRingkasan ? $hitungRingkasan($batas) : 0,
                'baris'          => (int) DB::table($tabel)->where('dicatat_pada', '<', $batas)->count(),
            ];
        }

        // Rangkum dulu. Bila melempar exception, penghapusan di bawah tidak dijalankan.
        $ringkasanBaru = $rangkum ? $rangkum($batas) : 0;

        return [
            'batas'          => $batas,
            'ringkasan_baru' => $ringkasanBaru,
            'baris'          => $this->hapusBertahap($tabel, $batas, $kelompok),
        ];
    }

    private function hari(string $kunci, int $bawaan): int
    {
        return max(self::MINIMUM_HARI, (int) config("lampu.{$kunci}", $bawaan));
    }

    /** Awal hari (zona tampil) N hari lalu, dinyatakan dalam zona aplikasi (zona penyimpanan). */
    private function batas(string $kunciHari, int $bawaan): string
    {
        return Carbon::now($this->zonaTampil())
            ->subDays($this->hari($kunciHari, $bawaan))
            ->startOfDay()
            ->setTimezone($this->zonaApp())
            ->toDateTimeString();
    }

    private function zonaApp(): string
    {
        return (string) config('app.timezone', 'UTC');
    }

    private function zonaTampil(): string
    {
        return (string) config('lampu.zona_ringkasan', 'Asia/Jakarta');
    }

    private function rangkumTelemetri(string $batas): int
    {
        $sql = <<<'SQL'
INSERT INTO ringkasan_telemetri_harian
    (sensor_id, tanggal, lux_rata, lux_min, lux_maks, suhu_rata, suhu_min, suhu_maks, jumlah_sampel, created_at, updated_at)
SELECT sensor_id,
       ((dicatat_pada AT TIME ZONE ?::text) AT TIME ZONE ?::text)::date AS tanggal,
       AVG(nilai_lux), MIN(nilai_lux), MAX(nilai_lux),
       AVG(suhu), MIN(suhu), MAX(suhu),
       COUNT(*), NOW(), NOW()
FROM read__sensors
WHERE dicatat_pada < ?
GROUP BY 1, 2
ON CONFLICT (sensor_id, tanggal) DO NOTHING
SQL;

        return DB::affectingStatement($sql, [$this->zonaApp(), $this->zonaTampil(), $batas]);
    }

    /**
     * kWh = daya x lama sampai pembacaan berikutnya (dibatasi celah maksimum, sama dengan
     * NodeRingkasanService dan LogEnergyService). Pembacaan terakhir sebelum batas
     * dihitung 0 karena pembacaan berikutnya belum ada; selisihnya paling banyak satu
     * celah dan ini memang estimasi.
     */
    private function rangkumEnergi(string $batas): int
    {
        $sql = <<<'SQL'
INSERT INTO ringkasan_energi_harian
    (sensor_id, tanggal, kwh, watt_rata, watt_maks, jumlah_sampel, created_at, updated_at)
SELECT sensor_id, tanggal,
       COALESCE(SUM(konsumsi_watt * LEAST(COALESCE(EXTRACT(EPOCH FROM (next_at - dicatat_pada)), 0), CAST(? AS integer)) / 3600000.0), 0),
       AVG(konsumsi_watt), MAX(konsumsi_watt), COUNT(*), NOW(), NOW()
FROM (
    SELECT sensor_id, konsumsi_watt, dicatat_pada,
           ((dicatat_pada AT TIME ZONE ?::text) AT TIME ZONE ?::text)::date AS tanggal,
           LEAD(dicatat_pada) OVER (PARTITION BY sensor_id ORDER BY dicatat_pada) AS next_at
    FROM log_energies
    WHERE dicatat_pada < ?
) t
GROUP BY sensor_id, tanggal
ON CONFLICT (sensor_id, tanggal) DO NOTHING
SQL;

        $celah = max(1, (int) config('lampu.energi_celah_maks_detik', 900));

        return DB::affectingStatement($sql, [$celah, $this->zonaApp(), $this->zonaTampil(), $batas]);
    }

    /** Untuk dry-run: berapa pasangan (node, hari) yang akan dirangkum. */
    private function hitungKelompokHari(string $tabel, string $batas): int
    {
        $sql = "SELECT COUNT(*) AS n FROM (
                    SELECT 1 FROM {$tabel}
                    WHERE dicatat_pada < ?
                    GROUP BY sensor_id, ((dicatat_pada AT TIME ZONE ?::text) AT TIME ZONE ?::text)::date
                ) x";

        $row = DB::selectOne($sql, [$batas, $this->zonaApp(), $this->zonaTampil()]);

        return (int) ($row->n ?? 0);
    }

    /** Hapus per kelompok kecil agar tabel tidak terkunci lama dan WAL tidak melonjak. */
    private function hapusBertahap(string $tabel, string $batas, int $kelompok): int
    {
        $total = 0;

        do {
            // $tabel dan $kelompok berasal dari konstanta/integer, bukan input pengguna.
            $dihapus = DB::affectingStatement(
                "DELETE FROM {$tabel} WHERE ctid IN (SELECT ctid FROM {$tabel} WHERE dicatat_pada < ? LIMIT {$kelompok})",
                [$batas]
            );
            $total += $dihapus;
        } while ($dihapus >= $kelompok);

        return $total;
    }
}
