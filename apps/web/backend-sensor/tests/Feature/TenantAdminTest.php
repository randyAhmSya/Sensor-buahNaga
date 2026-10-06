<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class TenantAdminTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_petani_tenant_aktif_bisa_akses_kebun(): void
    {
        $tenant = $this->buatTenant(['is_aktif' => true]);
        $petani = $this->buatUser($tenant);

        Sanctum::actingAs($petani);
        $this->getJson('/api/petani/kebun')->assertStatus(200);
    }

    public function test_superadmin_bisa_nonaktifkan_tenant_dan_tercatat_di_log(): void
    {
        $tenant = $this->buatTenant(['is_aktif' => true]);
        $superAdmin = $this->buatUser(role: 'superAdmin');

        Sanctum::actingAs($superAdmin);
        $this->patchJson("/api/admin/tenant/{$tenant->tenant_id}/nonaktifkan")
            ->assertStatus(200)
            ->assertJsonPath('data.is_aktif', false);

        $this->assertDatabaseHas('tenants', [
            'tenant_id' => $tenant->tenant_id,
            'is_aktif' => false,
        ]);

        $this->assertDatabaseHas('log_aktivitas_admins', [
            'admin_id' => $superAdmin->id,
            'aksi' => 'nonaktifkan_tenant',
            'target_tipe' => 'tenant',
            'target_id' => $tenant->tenant_id,
        ]);
    }

    public function test_petani_tenant_nonaktif_ditolak_di_semua_endpoint_terproteksi(): void
    {
        $tenant = $this->buatTenant(['is_aktif' => false]);
        $petani = $this->buatUser($tenant);

        Sanctum::actingAs($petani);

        $this->getJson('/api/petani/kebun')->assertStatus(403);
        $this->getJson('/api/petani/langganan/status')->assertStatus(403);
    }

    public function test_petani_tenant_nonaktif_tetap_bisa_login(): void
    {
        $tenant = $this->buatTenant(['is_aktif' => false]);
        $petani = $this->buatUser($tenant);

        $response = $this->postJson('/api/auth/login', [
            'email' => $petani->email,
            'password' => 'password123', // sesuai yang di-hash di buatUser()
        ]);

        $response->assertStatus(200);
        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_superadmin_bisa_aktifkan_lagi_tenant_yang_dinonaktifkan(): void
    {
        $tenant = $this->buatTenant(['is_aktif' => false]);
        $petani = $this->buatUser($tenant);
        $superAdmin = $this->buatUser(role: 'superAdmin');

        Sanctum::actingAs($superAdmin);
        $this->patchJson("/api/admin/tenant/{$tenant->tenant_id}/aktifkan")
            ->assertStatus(200)
            ->assertJsonPath('data.is_aktif', true);

        Sanctum::actingAs($petani);
        $this->getJson('/api/petani/kebun')->assertStatus(200);
    }

    public function test_detail_tenant_menampilkan_kebun_dan_user(): void
    {
        $tenant = $this->buatTenant();
        $this->buatKebun($tenant);
        $this->buatUser($tenant);
        $superAdmin = $this->buatUser(role: 'superAdmin');

        Sanctum::actingAs($superAdmin);
        $this->getJson("/api/admin/tenant/{$tenant->tenant_id}")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data.kebun')
            ->assertJsonCount(1, 'data.user');
    }

    public function test_tenant_tidak_ditemukan_404(): void
    {
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->getJson('/api/admin/tenant/00000000-0000-0000-0000-000000000000')
            ->assertStatus(404);
    }

    public function test_petani_tidak_bisa_akses_endpoint_tenant_admin(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);

        Sanctum::actingAs($petani);
        $this->getJson('/api/admin/tenant')->assertStatus(403);
    }
}