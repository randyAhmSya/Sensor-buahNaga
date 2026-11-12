<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use App\Models\SiklusPanen;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * Endpoint agregat per kebun: menggantikan N+1 request dari web
 * (status-lampu per blok, siklus panen per blok, blok per kebun).
 */
class AgregatKebunTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    private function masuk(): array
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));

        return [$tenant, $this->buatKebun($tenant)];
    }

    private function buatSiklus(string $blokId, string $tanggal): SiklusPanen
    {
        return SiklusPanen::create([
            'block_id' => $blokId,
            'tanggal_penyinaran' => $tanggal,
            'status_siklus' => 'AKTIF',
        ]);
    }

    public function test_status_lampu_kebun_memuat_semua_blok_termasuk_yang_tanpa_node(): void
    {
        [, $kebun] = $this->masuk();
        $blokA = $this->buatBlok($kebun);
        $blokB = $this->buatBlok($kebun);
        $node = $this->buatNodeSensor($blokA, $this->buatGateway($blokA));
        $node->forceFill(['jumlah_lampu' => 4, 'terakhir_terlihat' => now()])->save();

        $res = $this->getJson("/api/petani/kebun/{$kebun->id_kebun}/status-lampu")->assertOk();

        $data = collect($res->json('data'))->keyBy('blok_id');
        $this->assertCount(2, $data);
        $this->assertSame(4, $data[$blokA->id_blok]['jumlah_lampu']);
        $this->assertSame(4, $data[$blokA->id_blok]['jumlah_online']);
        $this->assertSame(1, $data[$blokA->id_blok]['node_online']);
        $this->assertSame(0, $data[$blokB->id_blok]['jumlah_node']);
        $this->assertSame(0, $data[$blokB->id_blok]['jumlah_lampu']);
    }

    public function test_status_lampu_kebun_sama_dengan_status_lampu_per_blok(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);
        $node = $this->buatNodeSensor($blok, $this->buatGateway($blok));
        $node->forceFill(['jumlah_lampu' => 3, 'watt_per_lampu' => 10, 'terakhir_terlihat' => now()->subHours(3)])->save();

        $perBlok = $this->getJson("/api/petani/blok/{$blok->id_blok}/status-lampu")->json('data');
        $perKebun = $this->getJson("/api/petani/kebun/{$kebun->id_kebun}/status-lampu")->json('data.0');

        unset($perKebun['blok_id']);
        $this->assertEquals($perBlok, $perKebun);
    }

    public function test_jumlah_query_status_lampu_kebun_tidak_bertambah_seiring_jumlah_blok(): void
    {
        [, $kebun] = $this->masuk();
        $this->buatBlok($kebun);

        $hitung = function () use ($kebun): int {
            DB::flushQueryLog();
            DB::enableQueryLog();
            $this->getJson("/api/petani/kebun/{$kebun->id_kebun}/status-lampu")->assertOk();

            return count(DB::getQueryLog());
        };

        $sedikit = $hitung();
        for ($i = 0; $i < 5; $i++) {
            $blok = $this->buatBlok($kebun);
            $this->buatNodeSensor($blok, $this->buatGateway($blok));
        }

        $this->assertSame($sedikit, $hitung());
    }

    public function test_status_lampu_kebun_menolak_id_tidak_valid_tidak_ada_dan_tenant_lain(): void
    {
        $this->masuk();
        $kebunLain = $this->buatKebun($this->buatTenant());

        $this->getJson('/api/petani/kebun/bukan-uuid/status-lampu')->assertStatus(400);
        $this->getJson('/api/petani/kebun/' . \Illuminate\Support\Str::uuid() . '/status-lampu')->assertStatus(404);
        $this->getJson("/api/petani/kebun/{$kebunLain->id_kebun}/status-lampu")->assertStatus(403);
    }

    public function test_siklus_panen_per_kebun_menggabungkan_semua_blok_urut_terbaru(): void
    {
        [$tenant, $kebun] = $this->masuk();
        $blokA = $this->buatBlok($kebun);
        $blokB = $this->buatBlok($kebun);
        $blokLuar = $this->buatBlok($this->buatKebun($tenant));
        $lama = $this->buatSiklus($blokA->id_blok, '2026-01-01');
        $baru = $this->buatSiklus($blokB->id_blok, '2026-06-01');
        $this->buatSiklus($blokLuar->id_blok, '2026-09-01');

        $res = $this->getJson("/api/petani/siklus-panen?kebun_id={$kebun->id_kebun}")->assertOk();

        $this->assertSame(
            [$baru->id_siklus_panen, $lama->id_siklus_panen],
            collect($res->json('data'))->pluck('id_siklus_panen')->all()
        );
    }

    public function test_siklus_panen_per_blok_tetap_berfungsi_dan_param_wajib(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);
        $this->buatSiklus($blok->id_blok, '2026-02-01');

        $this->getJson("/api/petani/siklus-panen?blok_id={$blok->id_blok}")
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->getJson('/api/petani/siklus-panen')->assertStatus(400);
    }

    public function test_siklus_panen_per_kebun_menolak_id_tidak_valid_dan_tenant_lain(): void
    {
        $this->masuk();
        $kebunLain = $this->buatKebun($this->buatTenant());

        $this->getJson('/api/petani/siklus-panen?kebun_id=bukan-uuid')->assertStatus(400);
        $this->getJson("/api/petani/siklus-panen?kebun_id={$kebunLain->id_kebun}")->assertStatus(403);
    }

    public function test_daftar_kebun_include_blok_memuat_blok_dengan_query_tetap(): void
    {
        [$tenant, $kebun] = $this->masuk();
        $this->buatBlok($kebun);
        $this->buatBlok($kebun);
        $kebunKedua = $this->buatKebun($tenant);
        $this->buatBlok($kebunKedua);

        $res = $this->getJson('/api/petani/kebun?include=blok')->assertOk();
        $data = collect($res->json('data'))->keyBy('id_kebun');

        $this->assertCount(2, $data[$kebun->id_kebun]['bloks']);
        $this->assertCount(1, $data[$kebunKedua->id_kebun]['bloks']);
        $this->assertSame(2, $data[$kebun->id_kebun]['bloks_count']);

        $tanpa = $this->getJson('/api/petani/kebun')->assertOk()->json('data.0');
        $this->assertArrayNotHasKey('bloks', $tanpa);
    }
}
