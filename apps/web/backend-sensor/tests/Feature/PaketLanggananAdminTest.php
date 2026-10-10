<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class PaketLanggananAdminTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_superadmin_bisa_bikin_paket_baru(): void
    {
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->postJson('/api/admin/paket-langganan', [
            'nama_paket' => 'Paket 30 Hari',
            'tambahan_hari' => 30,
            'harga' => 180000,
        ])->assertStatus(201)
            ->assertJsonPath('data.status_aktif', true);
    }

    public function test_paket_nonaktif_tidak_muncul_di_daftar_beli_petani(): void
    {
        $paketAktif = $this->buatPaketLangganan(['nama_paket' => 'Aktif']);
        $paketNonaktif = $this->buatPaketLangganan(['nama_paket' => 'Nonaktif', 'status_aktif' => false]);

        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        Sanctum::actingAs($petani);

        $response = $this->getJson('/api/petani/langganan/paket')->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id_paket');

        $this->assertTrue($ids->contains($paketAktif->id_paket));
        $this->assertFalse($ids->contains($paketNonaktif->id_paket));
    }

    public function test_paket_yang_belum_pernah_dipakai_boleh_dihapus(): void
    {
        $paket = $this->buatPaketLangganan();
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->deleteJson("/api/admin/paket-langganan/{$paket->id_paket}")->assertStatus(200);
        $this->assertDatabaseMissing('paket_langganans', ['id_paket' => $paket->id_paket]);
    }

    public function test_paket_yang_sudah_pernah_dipakai_di_transaksi_tidak_boleh_dihapus(): void
    {
        $paket = $this->buatPaketLangganan();
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);

        Sanctum::actingAs($petani);
        $this->postJson('/api/petani/langganan/beli', [
            'paket_langganan_id' => $paket->id_paket,
            'bukti_transfer' => \Illuminate\Http\UploadedFile::fake()->image('bukti.jpg'),
        ])->assertStatus(201);

        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->deleteJson("/api/admin/paket-langganan/{$paket->id_paket}")->assertStatus(409);
        $this->assertDatabaseHas('paket_langganans', ['id_paket' => $paket->id_paket]);
    }

    public function test_petani_tidak_bisa_akses_endpoint_admin_paket(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        Sanctum::actingAs($petani);

        $this->getJson('/api/admin/paket-langganan')->assertStatus(403);
    }
}