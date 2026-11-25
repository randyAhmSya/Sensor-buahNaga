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
 * Log sensor berhalaman: ?page / ?per_page / ?dari / ?sampai.
 * Tanpa parameter tersebut, perilaku lama (?limit) tetap sama.
 */
class TelemetriPaginasiTest extends TestCase
{
    use BuatDataUji;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    private function siapkan(int $jumlah = 0): object
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $blok = $this->buatBlok($this->buatKebun($tenant));
        $node = $this->buatNodeSensor($blok, $this->buatGateway($blok));

        Sanctum::actingAs($petani);

        // i=1 paling lama, i=$jumlah paling baru; selang 1 jam
        for ($i = 1; $i <= $jumlah; $i++) {
            DB::table('read__sensors')->insert([
                'id_read_sensor' => (string) Str::uuid(),
                'sensor_id' => $node->id_sensor,
                'nilai_lux' => $i,
                'suhu' => 25,
                'dicatat_pada' => now()->subHours($jumlah - $i)->toDateTimeString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $node;
    }

    private function lux($res): array
    {
        return collect($res->json('data'))->pluck('nilai_lux')->map(fn ($v) => (int) $v)->all();
    }

    public function test_halaman_pertama_terbaru_di_atas_dengan_meta(): void
    {
        $node = $this->siapkan(7);

        $res = $this->getJson("/api/petani/telemetri?sensor_id={$node->id_sensor}&page=1&per_page=3")->assertOk();

        $this->assertSame([7, 6, 5], $this->lux($res));
        $this->assertSame(1, $res->json('meta.current_page'));
        $this->assertSame(3, $res->json('meta.last_page'));
        $this->assertSame(3, $res->json('meta.per_page'));
        $this->assertSame(7, $res->json('meta.total'));
    }

    public function test_halaman_terakhir_berisi_sisa(): void
    {
        $node = $this->siapkan(7);

        $res = $this->getJson("/api/petani/telemetri?sensor_id={$node->id_sensor}&page=3&per_page=3")->assertOk();

        $this->assertSame([1], $this->lux($res));
    }

    public function test_per_page_dibatasi_maksimal_100(): void
    {
        $node = $this->siapkan(3);

        $res = $this->getJson("/api/petani/telemetri?sensor_id={$node->id_sensor}&page=1&per_page=5000")->assertOk();

        $this->assertSame(100, $res->json('meta.per_page'));
    }

    public function test_filter_rentang_waktu(): void
    {
        $node = $this->siapkan(10); // 10 baris, selang 1 jam, terbaru = sekarang

        $dari = now()->subHours(5)->subMinutes(1)->toDateTimeString();
        $sampai = now()->subHours(2)->addMinutes(1)->toDateTimeString();

        $res = $this->getJson("/api/petani/telemetri?sensor_id={$node->id_sensor}&page=1&dari=".urlencode($dari).'&sampai='.urlencode($sampai))->assertOk();

        // jam -5, -4, -3, -2  => nilai 5,6,7,8 ; terbaru di atas
        $this->assertSame([8, 7, 6, 5], $this->lux($res));
        $this->assertSame(4, $res->json('meta.total'));
    }

    public function test_sampai_sebelum_dari_ditolak(): void
    {
        $node = $this->siapkan();

        $this->getJson("/api/petani/telemetri?sensor_id={$node->id_sensor}&page=1&dari=2026-11-10&sampai=2026-11-01")
            ->assertStatus(422);
    }

    public function test_tanggal_tidak_valid_ditolak(): void
    {
        $node = $this->siapkan();

        $this->getJson("/api/petani/telemetri?sensor_id={$node->id_sensor}&page=1&dari=bukan-tanggal")
            ->assertStatus(422);
    }

    public function test_ekspor_mengembalikan_semua_baris_dalam_rentang(): void
    {
        $node = $this->siapkan(6);

        $res = $this->getJson("/api/petani/telemetri?sensor_id={$node->id_sensor}&ekspor=1")->assertOk();

        $this->assertSame([6, 5, 4, 3, 2, 1], $this->lux($res));
        $this->assertNull($res->json('meta'));
    }

    public function test_tanpa_page_perilaku_limit_lama_tetap(): void
    {
        $node = $this->siapkan(5);

        $res = $this->getJson("/api/petani/telemetri?sensor_id={$node->id_sensor}&limit=3")->assertOk();

        $this->assertSame([3, 4, 5], $this->lux($res));
        $this->assertNull($res->json('meta'));
    }

    public function test_sensor_tenant_lain_ditolak(): void
    {
        $tenantLain = $this->buatTenant();
        $blokLain = $this->buatBlok($this->buatKebun($tenantLain));
        $nodeLain = $this->buatNodeSensor($blokLain, $this->buatGateway($blokLain));

        $this->siapkan();

        $this->getJson("/api/petani/telemetri?sensor_id={$nodeLain->id_sensor}&page=1")->assertForbidden();
    }
}
