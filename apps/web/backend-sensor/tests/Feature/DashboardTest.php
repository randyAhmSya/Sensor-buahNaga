<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use App\Models\Blok;
use App\Models\JadwalLampu;
use App\Models\NodeSensor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    // ---------- helper ----------

    private function buatNodeDiBlok(Blok $blok, ?Carbon $terlihat = null): NodeSensor
    {
        $node = $this->buatNodeSensor($blok, $this->buatGateway($blok));
        $node->forceFill(['terakhir_terlihat' => $terlihat])->save();

        return $node;
    }

    private function buatSiklus(Blok $blok, string $status, ?Carbon $mulai = null): string
    {
        $id = (string) Str::uuid();
        DB::table('siklus_panens')->insert([
            'id_siklus_panen'    => $id,
            'block_id'           => $blok->id_blok,
            'tanggal_penyinaran' => ($mulai ?? now())->toDateTimeString(),
            'status_siklus'      => $status,
            'created_at'         => now(),
            'updated_at'         => now(),
        ]);

        return $id;
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

    private function barisBlok($res, string $idBlok): ?array
    {
        return collect($res->json('data.blok'))->firstWhere('id_blok', $idBlok);
    }

    // ---------- tes ----------

    public function test_ringkasan_menghitung_blok_node_dan_status(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);

        $blokOnline  = $this->buatBlok($kebun, ['nama_blok' => 'A']);
        $blokOffline = $this->buatBlok($kebun, ['nama_blok' => 'B']);
        $blokBaru    = $this->buatBlok($kebun, ['nama_blok' => 'C']);
        $this->buatBlok($kebun, ['nama_blok' => 'D']); // tanpa node

        $this->buatNodeDiBlok($blokOnline, now()->subSeconds(10));
        $this->buatNodeDiBlok($blokOffline, now()->subMinutes(30));
        $this->buatNodeDiBlok($blokBaru, null);

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/dashboard?kebun_id={$kebun->id_kebun}")->assertOk();

        $this->assertSame($kebun->id_kebun, $res->json('data.kebun.id_kebun'));
        $this->assertSame(4, $res->json('data.ringkasan.jumlah_blok'));
        $this->assertSame(3, $res->json('data.ringkasan.jumlah_node'));
        $this->assertSame(1, $res->json('data.ringkasan.node_online'));
        $this->assertSame(1, $res->json('data.ringkasan.node_offline'));
        $this->assertSame(1, $res->json('data.ringkasan.node_belum_terlihat'));

        $this->assertSame('online', $this->barisBlok($res, $blokOnline->id_blok)['node'][0]['status']);
        $this->assertSame('offline', $this->barisBlok($res, $blokOffline->id_blok)['node'][0]['status']);
        $this->assertSame('belum_pernah_terlihat', $this->barisBlok($res, $blokBaru->id_blok)['node'][0]['status']);
    }

    public function test_siklus_berjalan_per_blok_dan_yang_selesai_diabaikan(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);
        $blokA  = $this->buatBlok($kebun);
        $blokB  = $this->buatBlok($kebun);

        $idBerjalan = $this->buatSiklus($blokA, 'BERJALAN');
        $this->buatSiklus($blokB, 'SELESAI');

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/dashboard?kebun_id={$kebun->id_kebun}")->assertOk();

        $this->assertSame($idBerjalan, $this->barisBlok($res, $blokA->id_blok)['siklus_aktif']['id_siklus_panen']);
        $this->assertNull($this->barisBlok($res, $blokB->id_blok)['siklus_aktif']);
        $this->assertSame(1, $res->json('data.ringkasan.siklus_berjalan'));
    }

    public function test_jadwal_berlaku_override_lalu_default_lalu_belum_ada(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);

        $blokOverride = $this->buatBlok($kebun);
        $blokDefault  = $this->buatBlok($kebun);
        $blokTanpa    = $this->buatBlok($kebun);

        $nodeOverride = $this->buatNodeDiBlok($blokOverride, now());
        $this->buatNodeDiBlok($blokDefault, now());

        $default  = $this->buatJadwal(['kebun_id' => $kebun->id_kebun]);
        $override = $this->buatJadwal(['sensor_id' => $nodeOverride->id_sensor, 'jam_mulai_nyala' => '23:00:00']);

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/dashboard?kebun_id={$kebun->id_kebun}")->assertOk();

        $a = $this->barisBlok($res, $blokOverride->id_blok)['jadwal'];
        $this->assertSame('override', $a['sumber']);
        $this->assertSame($override->id_jadwal_lampu, $a['jadwal']['id_jadwal_lampu']);

        $b = $this->barisBlok($res, $blokDefault->id_blok)['jadwal'];
        $this->assertSame('default', $b['sumber']);
        $this->assertSame($default->id_jadwal_lampu, $b['jadwal']['id_jadwal_lampu']);

        $c = $this->barisBlok($res, $blokTanpa->id_blok)['jadwal'];
        $this->assertSame('tanpa_node', $c['sumber']);
        $this->assertSame($default->id_jadwal_lampu, $res->json('data.jadwal_default_kebun.id_jadwal_lampu'));
    }

    private function catatBacaan(NodeSensor $node, float $lux, ?float $suhu, Carbon $waktu): void
    {
        DB::table('read__sensors')->insert([
            'id_read_sensor' => (string) Str::uuid(),
            'sensor_id'      => $node->id_sensor,
            'nilai_lux'      => $lux,
            'suhu'           => $suhu,
            'dicatat_pada'   => $waktu->copy()->setTimezone(config('app.timezone'))->toDateTimeString(),
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    public function test_bacaan_terakhir_per_node_dan_bacaan_terbaru_kebun(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);

        $blokA = $this->buatBlok($kebun, ['nama_blok' => 'A']);
        $blokB = $this->buatBlok($kebun, ['nama_blok' => 'B']);
        $blokC = $this->buatBlok($kebun, ['nama_blok' => 'C']);

        $nodeA = $this->buatNodeDiBlok($blokA, now());
        $nodeB = $this->buatNodeDiBlok($blokB, now());
        $this->buatNodeDiBlok($blokC, null); // tanpa bacaan sama sekali

        // Node A: dua bacaan, yang terakhir (lux 80) harus dipakai.
        $this->catatBacaan($nodeA, 500, 30, now()->subMinutes(30));
        $this->catatBacaan($nodeA, 80, 27.5, now()->subSeconds(5));
        // Node B: bacaan lebih lama dari node A, jadi bukan "terbaru kebun".
        $this->catatBacaan($nodeB, 200, null, now()->subMinutes(10));

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/dashboard?kebun_id={$kebun->id_kebun}")->assertOk();

        $a = $this->barisBlok($res, $blokA->id_blok)['node'][0]['bacaan_terakhir'];
        $this->assertEquals(80, $a['nilai_lux']);
        $this->assertEquals(27.5, $a['suhu']);
        $this->assertFalse($a['basi']);

        $b = $this->barisBlok($res, $blokB->id_blok)['node'][0]['bacaan_terakhir'];
        $this->assertEquals(200, $b['nilai_lux']);
        $this->assertNull($b['suhu']);
        $this->assertTrue($b['basi']);

        $this->assertNull($this->barisBlok($res, $blokC->id_blok)['node'][0]['bacaan_terakhir']);

        $terbaru = $res->json('data.ringkasan.bacaan_terbaru');
        $this->assertEquals(80, $terbaru['nilai_lux']);
        $this->assertSame($nodeA->id_sensor, $terbaru['id_sensor']);
    }

    public function test_bacaan_terbaru_null_bila_belum_ada_bacaan(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);
        $this->buatNodeDiBlok($this->buatBlok($kebun), null);

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/dashboard?kebun_id={$kebun->id_kebun}")->assertOk();

        $this->assertNull($res->json('data.ringkasan.bacaan_terbaru'));
    }

    public function test_jumlah_query_tidak_bertambah_seiring_jumlah_blok(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebunKecil = $this->buatKebun($tenant);
        $kebunBesar = $this->buatKebun($tenant);

        $this->buatNodeDiBlok($this->buatBlok($kebunKecil), now());
        for ($i = 0; $i < 6; $i++) {
            $blok = $this->buatBlok($kebunBesar);
            $this->buatNodeDiBlok($blok, now());
            $this->buatSiklus($blok, 'BERJALAN');
        }

        Sanctum::actingAs($petani);

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson("/api/petani/dashboard?kebun_id={$kebunKecil->id_kebun}")->assertOk();
        $queryKecil = count(DB::getQueryLog());

        DB::flushQueryLog();
        $this->getJson("/api/petani/dashboard?kebun_id={$kebunBesar->id_kebun}")->assertOk();
        $queryBesar = count(DB::getQueryLog());

        $this->assertSame($queryKecil, $queryBesar, 'Jumlah query harus tetap, bukan N+1.');
    }

    public function test_kebun_id_wajib_dan_validasi_id(): void
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));

        $this->getJson('/api/petani/dashboard')->assertStatus(400);
        $this->getJson('/api/petani/dashboard?kebun_id=bukan-uuid')->assertStatus(404);
        $this->getJson('/api/petani/dashboard?kebun_id=' . Str::uuid())->assertStatus(404);
    }

    public function test_tenant_lain_tidak_boleh_melihat_dashboard(): void
    {
        $tenantA = $this->buatTenant();
        $tenantB = $this->buatTenant();
        $kebunA  = $this->buatKebun($tenantA);

        Sanctum::actingAs($this->buatUser($tenantB));

        $this->getJson("/api/petani/dashboard?kebun_id={$kebunA->id_kebun}")->assertStatus(403);
    }
}