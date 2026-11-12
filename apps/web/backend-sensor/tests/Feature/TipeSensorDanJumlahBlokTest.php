<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class TipeSensorDanJumlahBlokTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    /** @return array{0: \App\Models\Tenant, 1: \App\Models\Kebun} */
    private function masuk(): array
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));

        return [$tenant, $this->buatKebun($tenant)];
    }

    private function payloadNode(string $blokId, string $gatewayId, string $kode, string $tipe): array
    {
        return [
            'blok_id' => $blokId,
            'gateway_id' => $gatewayId,
            'kode_perangkat' => $kode,
            'tipe_sensor' => $tipe,
            'status_koneksi' => 'aktif',
        ];
    }

    public function test_node_boleh_bertipe_lux_suhu_dan_cahaya(): void
    {
        [, $kebun] = $this->masuk();
        $gateway = $this->buatGateway($this->buatBlok($kebun));

        foreach (['lux_suhu' => 'NODE-TIPE-01', 'cahaya' => 'NODE-TIPE-02'] as $tipe => $kode) {
            $blok = $this->buatBlok($kebun);
            $this->postJson('/api/petani/node', $this->payloadNode($blok->id_blok, $gateway->id_gateway, $kode, $tipe))
                ->assertStatus(201);
        }
    }

    public function test_node_menolak_tipe_sensor_di_luar_daftar(): void
    {
        [, $kebun] = $this->masuk();
        $gateway = $this->buatGateway($this->buatBlok($kebun));

        foreach (['kelembapan', 'suhu', 'Lux & Temp Sensor', 'LUX_SUHU'] as $i => $tipe) {
            $blok = $this->buatBlok($kebun);
            $this->postJson('/api/petani/node', $this->payloadNode($blok->id_blok, $gateway->id_gateway, 'NODE-BAD-0' . $i, $tipe))
                ->assertStatus(422)
                ->assertJsonValidationErrors('tipe_sensor');
        }
    }

    public function test_update_node_menolak_tipe_sensor_di_luar_daftar_dan_menerima_yang_sah(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);
        $gateway = $this->buatGateway($blok);
        $node = $this->buatNodeSensor($blok, $gateway);

        $this->putJson("/api/petani/node/{$node->id_sensor}", ['tipe_sensor' => 'kelembapan'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('tipe_sensor');

        $this->putJson("/api/petani/node/{$node->id_sensor}", ['tipe_sensor' => 'cahaya'])
            ->assertStatus(200);
    }

    public function test_daftar_kebun_memuat_jumlah_blok_tanpa_query_per_kebun(): void
    {
        [$tenant, $kebun] = $this->masuk();
        $this->buatBlok($kebun);
        $this->buatBlok($kebun);
        $this->buatBlok($kebun);
        $kebunKosong = $this->buatKebun($tenant);

        $hasil = collect($this->getJson('/api/petani/kebun')->assertOk()->json('data'))
            ->keyBy('id_kebun');

        $this->assertSame(3, $hasil[$kebun->id_kebun]['bloks_count']);
        $this->assertSame(0, $hasil[$kebunKosong->id_kebun]['bloks_count']);
    }
}
