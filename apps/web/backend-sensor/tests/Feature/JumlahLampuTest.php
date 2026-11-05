<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use App\Models\Blok;
use App\Models\NodeSensor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class JumlahLampuTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    private function nodeDiBlok(Blok $blok, array $atribut, ?Carbon $terlihat): NodeSensor
    {
        $node = $this->buatNodeSensor($blok, $this->buatGateway($blok));
        $node->forceFill(array_merge(['terakhir_terlihat' => $terlihat], $atribut))->save();

        return $node;
    }

    public function test_node_tanpa_isian_bernilai_satu_lampu_dan_watt_belum_diketahui(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);
        $blok   = $this->buatBlok($kebun);
        $node   = $this->buatNodeSensor($blok, $this->buatGateway($blok));

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/node/{$node->id_sensor}/ringkasan")->assertOk();

        $this->assertSame(1, $res->json('data.node.jumlah_lampu'));
        $this->assertNull($res->json('data.node.watt_per_lampu'));
        $this->assertNull($res->json('data.node.watt_terpasang'));
    }

    public function test_ringkasan_node_menghitung_watt_terpasang(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);
        $blok   = $this->buatBlok($kebun);
        $node   = $this->nodeDiBlok($blok, ['jumlah_lampu' => 12, 'watt_per_lampu' => 18.5], now());

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/node/{$node->id_sensor}/ringkasan")->assertOk();

        $this->assertSame(12, $res->json('data.node.jumlah_lampu'));
        $this->assertEquals(18.5, $res->json('data.node.watt_per_lampu'));
        $this->assertEquals(222.0, $res->json('data.node.watt_terpasang'));
    }

    public function test_dashboard_menjumlah_lampu_online_offline_dan_watt(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);

        $blokA = $this->buatBlok($kebun, ['nama_blok' => 'A']);
        $blokB = $this->buatBlok($kebun, ['nama_blok' => 'B']);

        $this->nodeDiBlok($blokA, ['jumlah_lampu' => 10, 'watt_per_lampu' => 20], now());
        $this->nodeDiBlok($blokB, ['jumlah_lampu' => 5, 'watt_per_lampu' => 10], now()->subHours(3));

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/dashboard?kebun_id={$kebun->id_kebun}")->assertOk();

        $this->assertSame(15, $res->json('data.ringkasan.jumlah_lampu'));
        $this->assertSame(10, $res->json('data.ringkasan.lampu_online'));
        $this->assertSame(5, $res->json('data.ringkasan.lampu_offline'));
        $this->assertEquals(250.0, $res->json('data.ringkasan.watt_terpasang'));

        $blok = collect($res->json('data.blok'))->firstWhere('id_blok', $blokA->id_blok);
        $this->assertSame(10, $blok['jumlah_lampu']);
        $this->assertSame(10, $blok['node'][0]['jumlah_lampu']);
        $this->assertEquals(200.0, $blok['node'][0]['watt_terpasang']);
    }

    public function test_watt_terpasang_kebun_null_bila_ada_node_tanpa_data_watt(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);

        $this->nodeDiBlok($this->buatBlok($kebun), ['jumlah_lampu' => 10, 'watt_per_lampu' => 20], now());
        $this->nodeDiBlok($this->buatBlok($kebun), ['jumlah_lampu' => 4], now());

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/dashboard?kebun_id={$kebun->id_kebun}")->assertOk();

        $this->assertSame(14, $res->json('data.ringkasan.jumlah_lampu'));
        $this->assertNull(
            $res->json('data.ringkasan.watt_terpasang'),
            'Total watt tidak boleh menyesatkan (kurang dari sebenarnya) bila ada node tanpa data watt.'
        );
    }
}
