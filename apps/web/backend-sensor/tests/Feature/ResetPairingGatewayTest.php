<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class ResetPairingGatewayTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    private function siapkan(): array
    {
        $this->withoutMiddleware(EnsureLanggananAktif::class);

        $tenant = $this->buatTenant();
        $user = $this->buatUser($tenant);
        $blok = $this->buatBlok($this->buatKebun($tenant));
        $gateway = $this->buatGateway($blok, [
            'token_gateway' => 'TOKEN-LAMA',
            'kode_pairing' => null,
            'status_koneksi' => 'terhubung',
            'terakhir_terlihat' => now(),
        ]);

        return [$user, $gateway];
    }

    public function test_reset_membuang_token_dan_menerbitkan_kode_baru(): void
    {
        [$user, $gateway] = $this->siapkan();
        Sanctum::actingAs($user);

        $res = $this->postJson("/api/petani/gateway/{$gateway->id_gateway}/reset-pairing")
            ->assertOk()
            ->assertJsonMissingPath('data.token_gateway');

        $baru = $gateway->fresh();
        $this->assertNull($baru->token_gateway);
        $this->assertMatchesRegularExpression('/^PAIR-[A-Z0-9]{6}$/', $baru->kode_pairing);
        $this->assertSame('belum_terhubung', $baru->status_koneksi);
        $this->assertNull($baru->terakhir_terlihat);
        $this->assertSame($baru->kode_pairing, $res->json('data.kode_pairing'));
    }

    public function test_kode_pairing_baru_berbeda_dari_yang_lama(): void
    {
        [$user, $gateway] = $this->siapkan();
        $gateway->update(['kode_pairing' => 'PAIR-LAMA01']);
        Sanctum::actingAs($user);

        $this->postJson("/api/petani/gateway/{$gateway->id_gateway}/reset-pairing")->assertOk();

        $this->assertNotSame('PAIR-LAMA01', $gateway->fresh()->kode_pairing);
    }

    public function test_setelah_reset_perangkat_bisa_pairing_ulang_dengan_kode_baru(): void
    {
        [$user, $gateway] = $this->siapkan();
        Sanctum::actingAs($user);
        $this->postJson("/api/petani/gateway/{$gateway->id_gateway}/reset-pairing")->assertOk();
        $kodeBaru = $gateway->fresh()->kode_pairing;

        $this->postJson('/api/petani/gateway/pair', [
            'kode_perangkat' => $gateway->kode_perangkat,
            'kode_pairing' => $kodeBaru,
        ])->assertOk()->assertJsonPath('data.gateway_id', $gateway->id_gateway);

        $this->assertNotSame('TOKEN-LAMA', $gateway->fresh()->token_gateway);
    }

    public function test_gateway_milik_tenant_lain_ditolak(): void
    {
        [, $gateway] = $this->siapkan();
        $penyusup = $this->buatUser($this->buatTenant());
        Sanctum::actingAs($penyusup);

        $this->postJson("/api/petani/gateway/{$gateway->id_gateway}/reset-pairing")->assertStatus(403);

        $this->assertSame('TOKEN-LAMA', $gateway->fresh()->token_gateway);
    }

    public function test_gateway_tidak_ada_404(): void
    {
        [$user] = $this->siapkan();
        Sanctum::actingAs($user);

        $this->postJson('/api/petani/gateway/' . Str::uuid() . '/reset-pairing')->assertStatus(404);
    }

    public function test_tanpa_login_401(): void
    {
        [, $gateway] = $this->siapkan();

        $this->postJson("/api/petani/gateway/{$gateway->id_gateway}/reset-pairing")->assertStatus(401);
    }
}