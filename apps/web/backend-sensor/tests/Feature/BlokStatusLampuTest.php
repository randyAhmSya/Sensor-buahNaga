<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * GET /api/petani/blok/{id}/status-lampu menghitung dalam LAMPU (bukan jumlah node):
 * satu node yang mengendalikan 10 lampu harus tampil sebagai 10, bukan 1.
 */
class BlokStatusLampuTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    private function siapkan(array $atributNode, $terlihat): array
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);
        $blok   = $this->buatBlok($kebun);
        $node   = $this->buatNodeSensor($blok, $this->buatGateway($blok));
        $node->forceFill(array_merge(['terakhir_terlihat' => $terlihat], $atributNode))->save();

        Sanctum::actingAs($petani);

        return [$blok, $node];
    }

    public function test_node_online_dengan_10_lampu_dihitung_10_lampu_online(): void
    {
        [$blok, $node] = $this->siapkan(['jumlah_lampu' => 10, 'watt_per_lampu' => 20], now());

        $res = $this->getJson("/api/petani/blok/{$blok->id_blok}/status-lampu")->assertOk();

        $this->assertSame(10, $res->json('data.jumlah_lampu'));
        $this->assertSame(10, $res->json('data.jumlah_online'));
        $this->assertSame(0, $res->json('data.jumlah_offline'));
        $this->assertSame(1, $res->json('data.jumlah_node'));
        $this->assertSame(1, $res->json('data.node_online'));
        $this->assertEquals(200.0, $res->json('data.watt_terpasang'));
        $this->assertSame(10, $res->json('data.nodes.0.jumlah_lampu'));
        $this->assertEquals(200.0, $res->json('data.nodes.0.watt_terpasang'));
    }

    public function test_node_offline_dengan_5_lampu_dihitung_5_lampu_offline_dan_watt_null(): void
    {
        [$blok] = $this->siapkan(['jumlah_lampu' => 5], now()->subHours(2));

        $res = $this->getJson("/api/petani/blok/{$blok->id_blok}/status-lampu")->assertOk();

        $this->assertSame(5, $res->json('data.jumlah_lampu'));
        $this->assertSame(0, $res->json('data.jumlah_online'));
        $this->assertSame(5, $res->json('data.jumlah_offline'));
        $this->assertSame(1, $res->json('data.node_offline'));
        $this->assertNull($res->json('data.watt_terpasang'), 'Watt belum diisi harus null, bukan 0.');
        $this->assertNull($res->json('data.nodes.0.watt_per_lampu'));
    }

    public function test_node_lama_tanpa_isian_tetap_dihitung_satu_lampu(): void
    {
        [$blok] = $this->siapkan([], now());

        $res = $this->getJson("/api/petani/blok/{$blok->id_blok}/status-lampu")->assertOk();

        $this->assertSame(1, $res->json('data.jumlah_lampu'));
        $this->assertSame(1, $res->json('data.jumlah_online'));
    }
}