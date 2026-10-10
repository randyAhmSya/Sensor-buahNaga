<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class KebunAksesTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_superadmin_wajib_isi_tenant_id_pas_list_kebun(): void
    {
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->getJson('/api/admin/kebun')->assertStatus(400);
    }

    public function test_superadmin_ditolak_kalau_tenant_belum_mengizinkan(): void
    {
        $tenant = $this->buatTenant(['is_admin_allowed' => false]);
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->getJson("/api/admin/kebun?tenant_id={$tenant->tenant_id}")
            ->assertStatus(403);
    }

    public function test_superadmin_bisa_list_kebun_kalau_tenant_mengizinkan(): void
    {
        $tenant = $this->buatTenant(['is_admin_allowed' => true]);
        $this->buatKebun($tenant);
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->getJson("/api/admin/kebun?tenant_id={$tenant->tenant_id}")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_superadmin_ditolak_bikin_kebun_kalau_tenant_belum_mengizinkan(): void
    {
        $tenant = $this->buatTenant(['is_admin_allowed' => false]);
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->postJson('/api/admin/kebun', [
            'tenant_id' => $tenant->tenant_id,
            'nama_kebun' => 'Kebun Ilegal',
        ])->assertStatus(403);
    }

    public function test_petani_cuma_lihat_kebun_tenant_sendiri(): void
    {
        $tenantSaya = $this->buatTenant();
        $tenantLain = $this->buatTenant();
        $this->buatKebun($tenantSaya);
        $this->buatKebun($tenantLain);

        $petani = $this->buatUser($tenantSaya);
        Sanctum::actingAs($petani);

        $this->getJson('/api/petani/kebun')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}