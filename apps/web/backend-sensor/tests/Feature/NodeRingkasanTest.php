<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use App\Models\JadwalLampu;
use App\Models\NodeSensor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class NodeRingkasanTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    // ---------- helper ----------

    /** Bekukan waktu pada jam dinding Asia/Jakarta, dinyatakan di zona aplikasi. */
    private function bekukan(string $jamJakarta): Carbon
    {
        $t = Carbon::parse($jamJakarta, 'Asia/Jakarta')->setTimezone(config('app.timezone'));
        $this->travelTo($t);

        return $t;
    }

    private function waktu(Carbon $t): string
    {
        return $t->copy()->setTimezone(config('app.timezone'))->toDateTimeString();
    }

    private function siapkan(?Carbon $terlihat = null): array
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant, ['nama_kebun' => 'Kebun Garjo']);
        $blok   = $this->buatBlok($kebun, ['nama_blok' => 'Blok 11']);
        $node   = $this->buatNodeSensor($blok, $this->buatGateway($blok, ['kode_perangkat' => 'GW-TES-1']));

        if ($terlihat) {
            $node->forceFill(['terakhir_terlihat' => $terlihat])->save();
        }

        return [$petani, $kebun, $blok, $node->fresh()];
    }

    private function catatBacaan(NodeSensor $node, ?float $lux, ?float $suhu, Carbon $waktu): void
    {
        DB::table('read__sensors')->insert([
            'id_read_sensor' => (string) Str::uuid(),
            'sensor_id'      => $node->id_sensor,
            'nilai_lux'      => $lux,
            'suhu'           => $suhu,
            'dicatat_pada'   => $this->waktu($waktu),
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    private function catatEnergi(NodeSensor $node, float $watt, Carbon $waktu): void
    {
        DB::table('log_energies')->insert([
            'id_log'        => (string) Str::uuid(),
            'sensor_id'     => $node->id_sensor,
            'konsumsi_watt' => $watt,
            'dicatat_pada'  => $this->waktu($waktu),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    private function catatDimming(NodeSensor $node, float $persen, float $lux, Carbon $waktu): void
    {
        DB::table('log_peredupans')->insert([
            'id_log_peredupan' => (string) Str::uuid(),
            'sensor_id'        => $node->id_sensor,
            'presentase_redup' => $persen,
            'nilai_lux'        => $lux,
            'fase_bulan'       => 'purnama',
            'dicatat_pada'     => $this->waktu($waktu),
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
    }

    private function buatJadwal(array $override): JadwalLampu
    {
        return JadwalLampu::forceCreate(array_merge([
            'jam_mulai_nyala'    => '18:00:00',
            'jam_akhir_nyala'    => '05:00:00',
            'mode'               => 'manual',
            'instensitas_cahaya' => 80,
            'status_aktif'       => true,
        ], $override));
    }

    private function ambil(string $idSensor)
    {
        return $this->getJson("/api/petani/node/{$idSensor}/ringkasan");
    }

    // ---------- isi ringkasan ----------

    public function test_ringkasan_lengkap_memakai_data_terbaru(): void
    {
        $sekarang = $this->bekukan('2026-10-30 22:00:00');
        [$petani, $kebun, $blok, $node] = $this->siapkan($sekarang->copy()->subSeconds(10));

        $this->catatBacaan($node, 100, 25.0, $sekarang->copy()->subMinutes(30));
        $this->catatBacaan($node, 300, 27.5, $sekarang->copy()->subSeconds(5));
        $this->catatBacaan($node, 200, 26.0, $sekarang->copy()->subMinutes(10));

        $this->catatEnergi($node, 20, $sekarang->copy()->subMinutes(10));
        $this->catatEnergi($node, 40, $sekarang->copy()->subSeconds(5));

        $this->catatDimming($node, 30, 400, $sekarang->copy()->subMinutes(20));
        $this->catatDimming($node, 55.5, 250, $sekarang->copy()->subSeconds(5));

        Sanctum::actingAs($petani);
        $res = $this->ambil($node->id_sensor)->assertOk();

        $this->assertSame($node->kode_perangkat, $res->json('data.node.kode_perangkat'));
        $this->assertSame('online', $res->json('data.node.status'));
        $this->assertTrue($res->json('data.node.status_online'));
        $this->assertNotNull($res->json('data.node.terakhir_terlihat'));
        $this->assertSame('Blok 11', $res->json('data.node.blok.nama_blok'));
        $this->assertSame('Kebun Garjo', $res->json('data.node.kebun.nama_kebun'));
        $this->assertSame('GW-TES-1', $res->json('data.node.gateway.kode_perangkat'));
        $this->assertNotEmpty($res->json('data.node.kode_qr'));

        $this->assertEquals(300, $res->json('data.bacaan_terakhir.nilai_lux'));
        $this->assertEquals(27.5, $res->json('data.bacaan_terakhir.suhu'));
        $this->assertFalse($res->json('data.bacaan_terakhir.basi'));

        $this->assertEquals(40, $res->json('data.energi.watt_terakhir'));
        $this->assertFalse($res->json('data.energi.basi'));

        $this->assertEquals(55.5, $res->json('data.dimming_terakhir.kecerahan_persen'));
        $this->assertEquals(250, $res->json('data.dimming_terakhir.nilai_lux'));
        $this->assertSame('purnama', $res->json('data.dimming_terakhir.fase_bulan'));
        $this->assertFalse($res->json('data.dimming_terakhir.basi'));

        // Mengikuti konfigurasi proyek, bukan angka tetap.
        $this->assertSame((int) config('lampu.offline_setelah_detik', 90), $res->json('data.batas_offline_detik'));
    }

    public function test_node_tanpa_data_mengembalikan_null_bukan_error(): void
    {
        [$petani, , , $node] = $this->siapkan(null);

        Sanctum::actingAs($petani);
        $res = $this->ambil($node->id_sensor)->assertOk();

        $this->assertSame('belum_pernah_terlihat', $res->json('data.node.status'));
        $this->assertFalse($res->json('data.node.status_online'));
        $this->assertNull($res->json('data.node.terakhir_terlihat'));
        $this->assertNull($res->json('data.bacaan_terakhir'));
        $this->assertNull($res->json('data.energi.watt_terakhir'));
        $this->assertEquals(0, $res->json('data.energi.kwh_24_jam'));
        $this->assertTrue($res->json('data.energi.basi'));
        $this->assertNull($res->json('data.dimming_terakhir'));
        $this->assertSame('belum_ada', $res->json('data.jadwal.sumber'));
        $this->assertNull($res->json('data.jadwal.jadwal'));
    }

    public function test_bacaan_lama_ditandai_basi_dan_node_offline(): void
    {
        $sekarang = $this->bekukan('2026-10-30 22:00:00');
        [$petani, , , $node] = $this->siapkan($sekarang->copy()->subMinutes(10));

        $this->catatBacaan($node, 150, 26, $sekarang->copy()->subMinutes(10));

        Sanctum::actingAs($petani);
        $res = $this->ambil($node->id_sensor)->assertOk();

        $this->assertSame('offline', $res->json('data.node.status'));
        $this->assertFalse($res->json('data.node.status_online'));
        $this->assertTrue($res->json('data.bacaan_terakhir.basi'));
        $this->assertEquals(150, $res->json('data.bacaan_terakhir.nilai_lux'));
    }

    // ---------- kWh ----------

    public function test_kwh_24_jam_tanpa_batas_celah_dan_data_lama_diabaikan(): void
    {
        config(['lampu.energi_celah_maks_detik' => 7200]);
        $sekarang = $this->bekukan('2026-10-30 22:00:00');
        [$petani, , , $node] = $this->siapkan($sekarang->copy()->subSeconds(5));

        $this->catatEnergi($node, 500, $sekarang->copy()->subHours(30)); // di luar 24 jam
        $this->catatEnergi($node, 100, $sekarang->copy()->subHours(2));   // 1 jam x 100 W = 0,1 kWh
        $this->catatEnergi($node, 200, $sekarang->copy()->subHour());     // 1 jam x 200 W = 0,2 kWh

        Sanctum::actingAs($petani);
        $res = $this->ambil($node->id_sensor)->assertOk();

        $this->assertEqualsWithDelta(0.3, (float) $res->json('data.energi.kwh_24_jam'), 0.001);
    }

    public function test_kwh_dibatasi_celah_maksimum_bawaan(): void
    {
        // Bawaan 900 detik: tiap pembacaan paling banyak dihitung 15 menit,
        // jadi node yang mati tidak dihitung terus memakai daya terakhirnya.
        $sekarang = $this->bekukan('2026-10-30 22:00:00');
        [$petani, , , $node] = $this->siapkan($sekarang->copy()->subSeconds(5));

        $this->catatEnergi($node, 100, $sekarang->copy()->subHours(2));
        $this->catatEnergi($node, 200, $sekarang->copy()->subHour());

        Sanctum::actingAs($petani);
        $res = $this->ambil($node->id_sensor)->assertOk();

        // (100 + 200) W x 900 dtk / 3.600.000 = 0,075 kWh
        $this->assertEqualsWithDelta(0.075, (float) $res->json('data.energi.kwh_24_jam'), 0.001);
    }

    // ---------- jadwal ----------

    public function test_jadwal_override_dan_status_jendela_nyala(): void
    {
        $sekarang = $this->bekukan('2026-10-30 22:00:00');
        [$petani, $kebun, , $node] = $this->siapkan($sekarang->copy()->subSeconds(5));

        $this->buatJadwal(['kebun_id' => $kebun->id_kebun]);
        $override = $this->buatJadwal([
            'sensor_id'       => $node->id_sensor,
            'mode'            => 'auto',
            'target_lux'      => 150,
            'jam_mulai_nyala' => '19:00:00',
            'jam_akhir_nyala' => '04:00:00',
        ]);

        Sanctum::actingAs($petani);

        $res = $this->ambil($node->id_sensor)->assertOk();
        $this->assertSame('override', $res->json('data.jadwal.sumber'));
        $this->assertSame($override->id_jadwal_lampu, $res->json('data.jadwal.jadwal.id_jadwal_lampu'));
        $this->assertSame('auto', $res->json('data.jadwal.jadwal.mode'));
        $this->assertTrue($res->json('data.jadwal.sedang_dalam_jendela_nyala'));

        // Siang hari, di luar jendela 19:00-04:00.
        $this->bekukan('2026-10-31 12:00:00');
        $res = $this->ambil($node->id_sensor)->assertOk();
        $this->assertFalse($res->json('data.jadwal.sedang_dalam_jendela_nyala'));
    }

    public function test_tanpa_override_memakai_default_kebun(): void
    {
        $this->bekukan('2026-10-30 22:00:00');
        [$petani, $kebun, , $node] = $this->siapkan(null);

        $default = $this->buatJadwal(['kebun_id' => $kebun->id_kebun]);

        Sanctum::actingAs($petani);
        $res = $this->ambil($node->id_sensor)->assertOk();

        $this->assertSame('default', $res->json('data.jadwal.sumber'));
        $this->assertSame($default->id_jadwal_lampu, $res->json('data.jadwal.jadwal.id_jadwal_lampu'));
        $this->assertTrue($res->json('data.jadwal.sedang_dalam_jendela_nyala'));
    }

    // ---------- akses ----------

    public function test_tenant_lain_ditolak_403(): void
    {
        [, , , $node] = $this->siapkan(null);

        Sanctum::actingAs($this->buatUser($this->buatTenant()));

        $this->ambil($node->id_sensor)->assertStatus(403);
    }

    public function test_id_tidak_valid_atau_tidak_ada_mengembalikan_404(): void
    {
        [$petani] = $this->siapkan(null);
        Sanctum::actingAs($petani);

        $this->getJson('/api/petani/node/bukan-uuid/ringkasan')->assertStatus(404);
        $this->ambil((string) Str::uuid())->assertStatus(404);
    }

    public function test_tanpa_login_ditolak_401(): void
    {
        $this->getJson('/api/petani/node/' . Str::uuid() . '/ringkasan')->assertStatus(401);
    }
}