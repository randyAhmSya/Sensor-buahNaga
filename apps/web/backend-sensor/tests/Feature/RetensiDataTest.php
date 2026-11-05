<?php

namespace Tests\Feature;

use App\Services\management_kebun\RetensiDataService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class RetensiDataTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    private function node()
    {
        $tenant = $this->buatTenant();
        $kebun  = $this->buatKebun($tenant);
        $blok   = $this->buatBlok($kebun);

        return $this->buatNodeSensor($blok, $this->buatGateway($blok));
    }

    /** Waktu N hari lalu pada jam tertentu, dalam zona aplikasi (zona penyimpanan). */
    private function waktu(int $hariLalu, string $jam = '10:00:00'): string
    {
        return Carbon::now(config('app.timezone'))->subDays($hariLalu)->setTimeFromTimeString($jam)->toDateTimeString();
    }

    private function tanggalTampil(string $waktuApp): string
    {
        return Carbon::parse($waktuApp, config('app.timezone'))
            ->setTimezone(config('lampu.zona_ringkasan', 'Asia/Jakarta'))
            ->toDateString();
    }

    private function telemetri($node, float $lux, ?float $suhu, string $waktu): void
    {
        DB::table('read__sensors')->insert([
            'id_read_sensor' => (string) Str::uuid(),
            'sensor_id'      => $node->id_sensor,
            'nilai_lux'      => $lux,
            'suhu'           => $suhu,
            'dicatat_pada'   => $waktu,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    private function energi($node, float $watt, string $waktu): void
    {
        DB::table('log_energies')->insert([
            'id_log'        => (string) Str::uuid(),
            'sensor_id'     => $node->id_sensor,
            'konsumsi_watt' => $watt,
            'dicatat_pada'  => $waktu,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    private function peredupan($node, string $waktu): void
    {
        DB::table('log_peredupans')->insert([
            'id_log_peredupan' => (string) Str::uuid(),
            'sensor_id'        => $node->id_sensor,
            'presentase_redup' => 50,
            'nilai_lux'        => 100,
            'fase_bulan'       => 'purnama',
            'dicatat_pada'     => $waktu,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
    }

    private function layanan(): RetensiDataService
    {
        return app(RetensiDataService::class);
    }

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'lampu.retensi_telemetri_hari' => 30,
            'lampu.retensi_energi_hari'    => 30,
            'lampu.retensi_peredupan_hari' => 365,
            'lampu.zona_ringkasan'         => 'Asia/Jakarta',
            'lampu.energi_celah_maks_detik' => 900,
        ]);
    }

    public function test_telemetri_lama_dirangkum_lalu_dihapus_yang_baru_tetap(): void
    {
        $node = $this->node();

        $lama = [$this->waktu(40, '10:00:00'), $this->waktu(40, '10:10:00'), $this->waktu(40, '10:20:00')];
        $this->telemetri($node, 100, 20, $lama[0]);
        $this->telemetri($node, 200, 30, $lama[1]);
        $this->telemetri($node, 300, 25, $lama[2]);

        $this->telemetri($node, 999, 28, $this->waktu(5));
        $this->telemetri($node, 998, 28, $this->waktu(1));

        $hasil = $this->layanan()->jalankan();

        $this->assertSame(3, $hasil['telemetri']['baris']);
        $this->assertSame(1, $hasil['telemetri']['ringkasan_baru']);
        $this->assertSame(2, DB::table('read__sensors')->count(), 'Data baru harus tetap ada.');

        $r = DB::table('ringkasan_telemetri_harian')->where('sensor_id', $node->id_sensor)->first();
        $this->assertNotNull($r);
        $this->assertSame($this->tanggalTampil($lama[0]), $r->tanggal);
        $this->assertSame(3, (int) $r->jumlah_sampel);
        $this->assertEqualsWithDelta(200, $r->lux_rata, 0.001);
        $this->assertEqualsWithDelta(100, $r->lux_min, 0.001);
        $this->assertEqualsWithDelta(300, $r->lux_maks, 0.001);
        $this->assertEqualsWithDelta(25, $r->suhu_rata, 0.001);
    }

    public function test_energi_lama_dirangkum_ke_kwh_lalu_dihapus(): void
    {
        $node = $this->node();

        // 60 W, selang 10 menit dua kali: 60 * (600 + 600) detik / 3.600.000 = 0,02 kWh.
        // Pembacaan terakhir dihitung 0 (belum ada pembacaan berikutnya).
        $this->energi($node, 60, $this->waktu(40, '10:00:00'));
        $this->energi($node, 60, $this->waktu(40, '10:10:00'));
        $this->energi($node, 60, $this->waktu(40, '10:20:00'));
        $this->energi($node, 40, $this->waktu(2));

        $hasil = $this->layanan()->jalankan();

        $this->assertSame(3, $hasil['energi']['baris']);
        $this->assertSame(1, DB::table('log_energies')->count());

        $r = DB::table('ringkasan_energi_harian')->where('sensor_id', $node->id_sensor)->first();
        $this->assertNotNull($r);
        $this->assertEqualsWithDelta(0.02, (float) $r->kwh, 0.0001);
        $this->assertEqualsWithDelta(60, $r->watt_rata, 0.001);
        $this->assertSame(3, (int) $r->jumlah_sampel);

        $this->assertEqualsWithDelta(0.02, $this->layanan()->kwhRingkasan($node->id_sensor), 0.001);
    }

    public function test_celah_besar_dibatasi_saat_merangkum_kwh(): void
    {
        $node = $this->node();

        // Celah 2 jam dibatasi 900 detik: 100 W * 900 / 3.600.000 = 0,025 kWh.
        $this->energi($node, 100, $this->waktu(40, '10:00:00'));
        $this->energi($node, 100, $this->waktu(40, '12:00:00'));

        $this->layanan()->jalankan();

        $r = DB::table('ringkasan_energi_harian')->where('sensor_id', $node->id_sensor)->first();
        $this->assertEqualsWithDelta(0.025, (float) $r->kwh, 0.0001);
    }

    public function test_dijalankan_dua_kali_tidak_menggandakan_ringkasan(): void
    {
        $node = $this->node();
        $this->telemetri($node, 100, 20, $this->waktu(40));
        $this->energi($node, 60, $this->waktu(40));

        $this->layanan()->jalankan();
        $kedua = $this->layanan()->jalankan();

        $this->assertSame(1, DB::table('ringkasan_telemetri_harian')->count());
        $this->assertSame(1, DB::table('ringkasan_energi_harian')->count());
        $this->assertSame(0, $kedua['telemetri']['baris']);
        $this->assertSame(0, $kedua['energi']['baris']);
    }

    public function test_dry_run_tidak_menulis_dan_tidak_menghapus(): void
    {
        $node = $this->node();
        $this->telemetri($node, 100, 20, $this->waktu(40));
        $this->telemetri($node, 110, 21, $this->waktu(41));
        $this->energi($node, 60, $this->waktu(40));
        $this->peredupan($node, $this->waktu(400));

        $hasil = $this->layanan()->jalankan(true);

        $this->assertSame(2, $hasil['telemetri']['baris']);
        $this->assertSame(2, $hasil['telemetri']['ringkasan_baru'], 'Dua hari berbeda = dua ringkasan.');
        $this->assertSame(1, $hasil['energi']['baris']);
        $this->assertSame(1, $hasil['peredupan']['baris']);

        $this->assertSame(2, DB::table('read__sensors')->count());
        $this->assertSame(1, DB::table('log_energies')->count());
        $this->assertSame(1, DB::table('log_peredupans')->count());
        $this->assertSame(0, DB::table('ringkasan_telemetri_harian')->count());
        $this->assertSame(0, DB::table('ringkasan_energi_harian')->count());
    }

    public function test_peredupan_hanya_dihapus_lewat_retensi_lebih_panjang(): void
    {
        $node = $this->node();
        $this->peredupan($node, $this->waktu(400));
        $this->peredupan($node, $this->waktu(100));

        $hasil = $this->layanan()->jalankan();

        $this->assertSame(1, $hasil['peredupan']['baris']);
        $this->assertSame(1, DB::table('log_peredupans')->count());
    }

    public function test_retensi_nol_atau_terlalu_kecil_dipaksa_minimal_7_hari(): void
    {
        config(['lampu.retensi_telemetri_hari' => 0]);

        $node = $this->node();
        $this->telemetri($node, 1, 20, $this->waktu(10));
        $this->telemetri($node, 2, 20, $this->waktu(3));

        $this->layanan()->jalankan();

        $sisa = DB::table('read__sensors')->pluck('nilai_lux')->map(fn ($v) => (int) $v)->all();
        $this->assertSame([2], $sisa, 'Data 3 hari lalu harus aman walau retensi diset 0.');
    }

    public function test_penghapusan_bertahap_menghabiskan_semua_baris_lama(): void
    {
        config(['lampu.retensi_ukuran_kelompok' => 100]);

        $node = $this->node();
        $baris = [];
        for ($i = 0; $i < 250; $i++) {
            $baris[] = [
                'id_read_sensor' => (string) Str::uuid(),
                'sensor_id'      => $node->id_sensor,
                'nilai_lux'      => $i,
                'suhu'           => 25,
                'dicatat_pada'   => Carbon::parse($this->waktu(40, '08:00:00'))->addSeconds($i * 10)->toDateTimeString(),
                'created_at'     => now(),
                'updated_at'     => now(),
            ];
        }
        DB::table('read__sensors')->insert($baris);

        $hasil = $this->layanan()->jalankan();

        $this->assertSame(250, $hasil['telemetri']['baris']);
        $this->assertSame(0, DB::table('read__sensors')->count());
        $this->assertSame(250, (int) DB::table('ringkasan_telemetri_harian')->value('jumlah_sampel'));
    }

    public function test_perintah_artisan_dry_run_berhasil(): void
    {
        $this->artisan('lampu:pangkas-data', ['--dry-run' => true])->assertExitCode(0);
    }
}
