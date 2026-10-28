<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class LogPeredupanTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
        Carbon::setTestNow(Carbon::parse('2026-10-27 22:03:00', config('app.timezone')));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function buatNodeUntuk($tenant)
    {
        $blok = $this->buatBlok($this->buatKebun($tenant));

        return $this->buatNodeSensor($blok, $this->buatGateway($blok));
    }

    private function catat(string $sensorId, string $waktu, float $persen, float $lux): void
    {
        DB::table('log_peredupans')->insert([
            'id_log_peredupan' => (string) Str::uuid(),
            'sensor_id'        => $sensorId,
            'presentase_redup' => $persen,
            'nilai_lux'        => $lux,
            'dicatat_pada'     => Carbon::parse($waktu, config('app.timezone')),
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
    }

    public function test_titik_dirata_ratakan_per_bucket(): void
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));
        $node = $this->buatNodeUntuk($tenant);

        // bucket 21:00–21:10 (3 sampel), bucket 21:10–21:20 (1 sampel)
        $this->catat($node->id_sensor, '2026-10-27 21:00:10', 100, 0);
        $this->catat($node->id_sensor, '2026-10-27 21:03:00', 80, 20);
        $this->catat($node->id_sensor, '2026-10-27 21:07:00', 60, 40);
        $this->catat($node->id_sensor, '2026-10-27 21:12:00', 30, 90);

        $res = $this->getJson("/api/petani/log-peredupan?sensor_id={$node->id_sensor}&jam=6&interval_menit=10")
            ->assertOk();

        $titik = $res->json('data.titik');
        $this->assertCount(2, $titik);
        $this->assertEquals(80.0, $titik[0]['kecerahan_persen']);
        $this->assertEquals(20.0, $titik[0]['lux']);
        $this->assertSame(3, $titik[0]['jumlah_sampel']);
        $this->assertEquals(30.0, $titik[1]['kecerahan_persen']);
        $this->assertSame(1, $titik[1]['jumlah_sampel']);
        $this->assertSame(10, $res->json('data.interval_menit'));
    }

    public function test_hanya_data_dalam_rentang_jam_dan_milik_sensor_itu(): void
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));
        $node = $this->buatNodeUntuk($tenant);
        $nodeLain = $this->buatNodeUntuk($tenant);

        $this->catat($node->id_sensor, '2026-10-27 21:30:00', 50, 10);       // masuk (1,5 jam lalu)
        $this->catat($node->id_sensor, '2026-10-27 15:00:00', 99, 99);       // di luar jam=2
        $this->catat($nodeLain->id_sensor, '2026-10-27 21:30:00', 10, 10);   // sensor lain

        $res = $this->getJson("/api/petani/log-peredupan?sensor_id={$node->id_sensor}&jam=2")->assertOk();

        $titik = $res->json('data.titik');
        $this->assertCount(1, $titik);
        $this->assertEquals(50.0, $titik[0]['kecerahan_persen']);
    }

    public function test_tanpa_data_mengembalikan_titik_kosong(): void
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));
        $node = $this->buatNodeUntuk($tenant);

        $this->getJson("/api/petani/log-peredupan?sensor_id={$node->id_sensor}")
            ->assertOk()
            ->assertJsonPath('data.titik', []);
    }

    public function test_tenant_lain_ditolak_403(): void
    {
        $node = $this->buatNodeUntuk($this->buatTenant());

        Sanctum::actingAs($this->buatUser($this->buatTenant()));

        $this->getJson("/api/petani/log-peredupan?sensor_id={$node->id_sensor}")->assertStatus(403);
    }

    public function test_sensor_tidak_ada_404_dan_parameter_salah_422(): void
    {
        Sanctum::actingAs($this->buatUser($this->buatTenant()));

        $this->getJson('/api/petani/log-peredupan?sensor_id=' . Str::uuid())->assertStatus(404);
        $this->getJson('/api/petani/log-peredupan')->assertStatus(422);
        $this->getJson('/api/petani/log-peredupan?sensor_id=' . Str::uuid() . '&jam=999')->assertStatus(422);
    }
}