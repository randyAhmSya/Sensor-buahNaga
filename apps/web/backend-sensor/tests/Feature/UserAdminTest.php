<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class UserAdminTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_superadmin_bisa_bikin_user_petani_dengan_tenant_id(): void
    {
        $tenant = $this->buatTenant();
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->postJson('/api/admin/user', [
            'nama_lengkap' => 'Petani Baru',
            'email' => 'petani-baru-admin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'petani_biasa',
            'tenant_id' => $tenant->tenant_id,
        ])->assertStatus(201)
            ->assertJsonPath('data.role', 'petani_biasa');
    }

    public function test_bikin_user_petani_tanpa_tenant_id_ditolak(): void
    {
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->postJson('/api/admin/user', [
            'nama_lengkap' => 'Petani Tanpa Tenant',
            'email' => 'tanpa-tenant@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'petani_biasa',
        ])->assertStatus(422);
    }

    public function test_bikin_user_superadmin_dengan_tenant_id_ditolak(): void
    {
        $tenant = $this->buatTenant();
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->postJson('/api/admin/user', [
            'nama_lengkap' => 'Admin Nyasar',
            'email' => 'admin-nyasar@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'superAdmin',
            'tenant_id' => $tenant->tenant_id,
        ])->assertStatus(422);
    }

    public function test_user_yang_dinonaktifkan_tidak_bisa_login(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->patchJson("/api/admin/user/{$petani->id}/nonaktifkan")->assertStatus(200);

        $this->postJson('/api/auth/login', [
            'email' => $petani->email,
            'password' => 'password123',
        ])->assertStatus(403);
    }

 public function test_nonaktifkan_user_menghapus_token_dari_database(): void
{
    $tenant = $this->buatTenant();
    $petani = $this->buatUser($tenant);
    $tokenPetani = $petani->createToken('auth_token')->plainTextToken;
    [$idTokenPetani] = explode('|', $tokenPetani, 2);

    $superAdmin = $this->buatUser(role:  'superAdmin');
    $tokenAdmin = $superAdmin->createToken('auth_token')->plainTextToken;

    $this->withHeader('Authorization', "Bearer {$tokenAdmin}")
        ->patchJson("/api/admin/user/{$petani->id}/nonaktifkan")
        ->assertStatus(200);

    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $idTokenPetani]);
}

public function test_token_yang_sudah_dihapus_tidak_bisa_dipakai_akses_endpoint(): void
{
    $tenant = $this->buatTenant();
    $petani = $this->buatUser($tenant);
    $tokenPetani = $petani->createToken('auth_token')->plainTextToken;

    // simulasi langsung lewat DB, bukan lewat HTTP call sebagai admin -
    // biar test ini cuma punya SATU authenticated call, nggak kena gotcha cache guard
    $petani->tokens()->delete();

    $this->withHeader('Authorization', "Bearer {$tokenPetani}")
        ->getJson('/api/petani/langganan/status')
        ->assertStatus(401);
}

    public function test_superadmin_tidak_bisa_nonaktifkan_akun_sendiri(): void
    {
        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->patchJson("/api/admin/user/{$superAdmin->id}/nonaktifkan")
            ->assertStatus(422);
    }

    public function test_user_yang_diaktifkan_lagi_bisa_login(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $petani->update(['is_aktif' => false]);

        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);
        $this->patchJson("/api/admin/user/{$petani->id}/aktifkan")->assertStatus(200);

        $this->postJson('/api/auth/login', [
            'email' => $petani->email,
            'password' => 'password123',
        ])->assertStatus(200);
    }

    public function test_petani_tidak_bisa_akses_endpoint_user_admin(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        Sanctum::actingAs($petani);

        $this->getJson('/api/admin/user')->assertStatus(403);
    }

    public function test_filter_list_user_berdasarkan_tenant(): void
    {
        $tenantA = $this->buatTenant();
        $tenantB = $this->buatTenant();
        $this->buatUser($tenantA);
        $this->buatUser($tenantB);

        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->getJson("/api/admin/user?tenant_id={$tenantA->tenant_id}")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}