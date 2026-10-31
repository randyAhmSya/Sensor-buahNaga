<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * Menjaga perbaikan: endpoint telemetri dan log-energy mengembalikan N data TERBARU
 * (bukan N tertua), dan tetap berurutan naik (lama ke baru) untuk grafik.
 */
class UrutanTerbaruTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    private function siapkan(): array
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);
        $blok   = $this->buatBlok($kebun);
        $node   = $this->buatNodeSensor($blok, $this->buatGateway($blok));

        Sanctum::actingAs($petani);

        return [$node];
    }

    public function test_telemetri_mengembalikan_data_terbaru_berurutan_naik(): void
    {
        [$node] = $this->siapkan();

        foreach ([1, 2, 3, 4, 5] as $i) {
            DB::table('read__sensors')->insert([
                'id_read_sensor' => (string) Str::uuid(),
                'sensor_id'      => $node->id_sensor,
                'nilai_lux'      => $i,
                'suhu'           => 25,
                'dicatat_pada'   => now()->subMinutes(10 - $i)->toDateTimeString(),
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        $res = $this->getJson("/api/petani/telemetri?sensor_id={$node->id_sensor}&limit=3")->assertOk();

        $lux = collect($res->json('data'))->pluck('nilai_lux')->map(fn ($v) => (int) $v)->all();
        $this->assertSame([3, 4, 5], $lux);
    }

    public function test_log_energy_mengembalikan_data_terbaru_berurutan_naik(): void
    {
        [$node] = $this->siapkan();

        foreach ([10, 20, 30, 40, 50] as $i => $watt) {
            DB::table('log_energies')->insert([
                'id_log'        => (string) Str::uuid(),
                'sensor_id'     => $node->id_sensor,
                'konsumsi_watt' => $watt,
                'dicatat_pada'  => now()->subMinutes(10 - $i)->toDateTimeString(),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        $res = $this->getJson("/api/petani/log-energy?sensor_id={$node->id_sensor}&limit=3")->assertOk();

        $watt = collect($res->json('data.riwayat'))->pluck('konsumsi_watt')->map(fn ($v) => (int) $v)->all();
        $this->assertSame([30, 40, 50], $watt);
    }
}