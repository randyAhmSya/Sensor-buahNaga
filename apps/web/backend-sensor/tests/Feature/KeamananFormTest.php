<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use App\Models\Gateway;
use App\Rules\KodePerangkatAman;
use App\Services\management_kebun\LogEnergyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class KeamananFormTest extends TestCase
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

    // ---------- Rule KodePerangkatAman ----------

    public function test_rule_menolak_baris_baru_di_ujung_dan_karakter_berbahaya(): void
    {
        foreach (["GTW-A\n", "GTW-A\ntopic readwrite #", 'a/b', 'a#c', 'a+b', 'a b', 'ab', str_repeat('x', 51), '', null, ['x']] as $kode) {
            $this->assertFalse(KodePerangkatAman::valid($kode), 'seharusnya ditolak: ' . json_encode($kode));
        }

        foreach (['GTW-ESP32-01', 'PAIR-TEST01', 'ESP32_01', 'abc'] as $kode) {
            $this->assertTrue(KodePerangkatAman::valid($kode), "seharusnya lolos: {$kode}");
        }
    }

    // ---------- Gateway: tambah ----------

    public function test_gateway_pertama_berhasil_dan_status_serta_kode_pairing_dari_server(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);

        $this->postJson('/api/petani/gateway', [
            'blok_id' => $blok->id_blok,
            'kode_perangkat' => 'GTW-TEST-01',
            'status_koneksi' => 'terhubung',
            'kode_pairing' => 'PAIR-AAAAAA',
        ])->assertStatus(201);

        $gw = Gateway::where('kode_perangkat', 'GTW-TEST-01')->first();
        $this->assertSame('belum_terhubung', $gw->status_koneksi);
        $this->assertMatchesRegularExpression('/^PAIR-[A-Z0-9]{6}$/', $gw->kode_pairing);
        $this->assertNull($gw->token_gateway);
    }

    public function test_gateway_kedua_di_kebun_yang_sama_ditolak(): void
    {
        [, $kebun] = $this->masuk();
        $this->buatGateway($this->buatBlok($kebun));
        $blokB = $this->buatBlok($kebun);

        $this->postJson('/api/petani/gateway', [
            'blok_id' => $blokB->id_blok,
            'kode_perangkat' => 'GTW-TEST-02',
            'status_koneksi' => 'belum_terhubung',
        ])->assertStatus(422);

        $this->assertSame(1, Gateway::count());
    }

    public function test_kebun_lain_pada_tenant_yang_sama_boleh_punya_gateway_sendiri(): void
    {
        [$tenant, $kebun] = $this->masuk();
        $this->buatGateway($this->buatBlok($kebun));
        $blokKebunLain = $this->buatBlok($this->buatKebun($tenant));

        $this->postJson('/api/petani/gateway', [
            'blok_id' => $blokKebunLain->id_blok,
            'kode_perangkat' => 'GTW-TEST-03',
            'status_koneksi' => 'belum_terhubung',
        ])->assertStatus(201);
    }

    public function test_kode_gateway_berbahaya_ditolak(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);

        // baris baru di ujung sengaja tidak diuji lewat HTTP: middleware TrimStrings
        // membuangnya sebelum validasi. Kasus itu dijaga di test rule di atas.
        foreach (["GTW-A\ntopic readwrite #", 'a/b', 'a#c', 'a+b', 'ab', str_repeat('x', 51)] as $kode) {
            $this->postJson('/api/petani/gateway', [
                'blok_id' => $blok->id_blok,
                'kode_perangkat' => $kode,
                'status_koneksi' => 'belum_terhubung',
            ])->assertStatus(422);
        }

        $this->assertSame(0, Gateway::count());
    }

    public function test_tambah_gateway_di_blok_tenant_lain_ditolak(): void
    {
        $this->masuk();
        $blokAsing = $this->buatBlok($this->buatKebun($this->buatTenant()));

        $this->postJson('/api/petani/gateway', [
            'blok_id' => $blokAsing->id_blok,
            'kode_perangkat' => 'GTW-TEST-04',
            'status_koneksi' => 'belum_terhubung',
        ])->assertStatus(403);
    }

    // ---------- Gateway: update dan pairing ----------

    public function test_update_gateway_tidak_bisa_memindahkan_blok_dan_tidak_error(): void
    {
        [$tenant, $kebun] = $this->masuk();
        $blokAsal = $this->buatBlok($kebun);
        $gateway = $this->buatGateway($blokAsal);
        $blokAsing = $this->buatBlok($this->buatKebun($this->buatTenant()));

        $this->putJson("/api/petani/gateway/{$gateway->id_gateway}", [
            'blok_id' => $blokAsing->id_blok,
            'kode_perangkat' => 'DIBAJAK-01',
            'mac_address' => 'AA:BB:CC:DD:EE:FF',
        ])->assertOk();

        $baru = $gateway->fresh();
        $this->assertSame($blokAsal->id_blok, $baru->blok_id);
        $this->assertSame($gateway->kode_perangkat, $baru->kode_perangkat);
    }

    public function test_pairing_menolak_format_kode_tidak_valid(): void
    {
        foreach ([
            ['kode_perangkat' => 'a/b', 'kode_pairing' => 'PAIR-AAAAAA'],
            ['kode_perangkat' => 'GTW-OK-01', 'kode_pairing' => "x\ny"],
            ['kode_perangkat' => str_repeat('x', 300), 'kode_pairing' => 'PAIR-AAAAAA'],
        ] as $payload) {
            $this->postJson('/api/petani/gateway/pair', $payload)->assertStatus(422);
        }
    }

    // ---------- Node: tambah ----------

    public function test_node_di_blok_lain_boleh_memakai_gateway_kebun_yang_sama(): void
    {
        [, $kebun] = $this->masuk();
        $gateway = $this->buatGateway($this->buatBlok($kebun));
        $blokB = $this->buatBlok($kebun);

        $this->postJson('/api/petani/node', [
            'blok_id' => $blokB->id_blok,
            'gateway_id' => $gateway->id_gateway,
            'kode_perangkat' => 'NODE-TEST-01',
            'tipe_sensor' => 'lux_suhu',
            'status_koneksi' => 'aktif',
        ])->assertStatus(201);
    }

    public function test_node_dengan_gateway_kebun_lain_ditolak(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);
        $gatewayAsing = $this->buatGateway($this->buatBlok($this->buatKebun($this->buatTenant())));

        $this->postJson('/api/petani/node', [
            'blok_id' => $blok->id_blok,
            'gateway_id' => $gatewayAsing->id_gateway,
            'kode_perangkat' => 'NODE-TEST-02',
            'tipe_sensor' => 'lux_suhu',
            'status_koneksi' => 'aktif',
        ])->assertStatus(422)->assertJsonValidationErrors('gateway_id');
    }

    public function test_node_dengan_qr_id_valid_tidak_lagi_error_500(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);
        $gateway = $this->buatGateway($blok);
        $qr = $this->buatKodeQr();

        $this->postJson('/api/petani/node', [
            'blok_id' => $blok->id_blok,
            'gateway_id' => $gateway->id_gateway,
            'qr_id' => $qr->id_qr,
            'kode_perangkat' => 'NODE-TEST-03',
            'tipe_sensor' => 'lux_suhu',
            'status_koneksi' => 'aktif',
        ])->assertStatus(201);
    }

    // ---------- Node: update ----------

    public function test_update_node_ke_gateway_tenant_lain_ditolak(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);
        $gatewayMilik = $this->buatGateway($blok);
        $node = $this->buatNodeSensor($blok, $gatewayMilik);
        $gatewayAsing = $this->buatGateway($this->buatBlok($this->buatKebun($this->buatTenant())));

        $this->putJson("/api/petani/node/{$node->id_sensor}", [
            'gateway_id' => $gatewayAsing->id_gateway,
        ])->assertStatus(422)->assertJsonValidationErrors('gateway_id');

        $this->assertSame($gatewayMilik->id_gateway, $node->fresh()->gateway_id);
    }

    public function test_update_node_lewat_kode_perangkat_di_url_tidak_error_500(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);
        $node = $this->buatNodeSensor($blok, $this->buatGateway($blok), null, ['kode_perangkat' => 'NODE-LAMA-01']);

        $this->putJson('/api/petani/node/NODE-LAMA-01', [
            'kode_perangkat' => 'NODE-BARU-01',
        ])->assertOk();

        $this->assertSame('NODE-BARU-01', $node->fresh()->kode_perangkat);
    }

    public function test_update_node_menolak_kode_perangkat_berbahaya(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);
        $node = $this->buatNodeSensor($blok, $this->buatGateway($blok));

        $this->putJson("/api/petani/node/{$node->id_sensor}", [
            'kode_perangkat' => 'a b/c#',
        ])->assertStatus(422)->assertJsonValidationErrors('kode_perangkat');
    }

    // ---------- Beban query ----------

    public function test_riwayat_energi_membatasi_limit_ekstrem(): void
    {
        [, $kebun] = $this->masuk();
        $blok = $this->buatBlok($kebun);
        $node = $this->buatNodeSensor($blok, $this->buatGateway($blok));

        // sebelum dijepit, limit negatif membuat Postgres melempar error
        $this->assertCount(0, app(LogEnergyService::class)->getRiwayatBySensor($node->id_sensor, -5));

        $this->getJson("/api/petani/log-energy?sensor_id={$node->id_sensor}&limit=999999999")->assertOk();
    }
}
