<?php

namespace Tests\Feature;

use App\Models\AksesTenantAdmin;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AksesTenantHttpTest extends TestCase
{
    use RefreshDatabase;

    protected function buatTenant(array $overrides = []): Tenant
    {
        return Tenant::create(array_merge([
            'tenant_id'   => (string) Str::uuid(),
            'nama_tenant' => 'Tenant Uji ' . Str::random(5),
        ], $overrides));
    }

    protected function buatSuperAdmin(array $overrides = []): User
    {
        return User::create(array_merge([
            'nama_lengkap' => 'Super Admin Uji ' . Str::random(5),
            'email'        => Str::random(10) . '@test.local',
            'password'     => 'password123',
            'role'         => 'superAdmin',
        ], $overrides));
    }

    protected function buatPetani(Tenant $tenant, array $overrides = []): User
    {
        return User::create(array_merge([
            'tenant_id'    => $tenant->tenant_id,
            'nama_lengkap' => 'Petani Uji ' . Str::random(5),
            'email'        => Str::random(10) . '@test.local',
            'password'     => 'password123',
            'role'         => 'petani',
        ], $overrides));
    }

    public function test_superadmin_bisa_mengajukan_permintaan_akses(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatSuperAdmin();
        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/tenant/{$tenant->tenant_id}/minta-akses", [
            'alasan' => 'Perlu cek sensor',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'succes') // typo ini memang ada di ApiResponser aslinya
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('akses_tenant_admins', [
            'tenant_id' => $tenant->tenant_id,
            'admin_id'  => $admin->id,
            'status'    => 'pending',
        ]);
    }

    public function test_petani_tidak_bisa_mengakses_endpoint_superadmin(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatPetani($tenant);
        Sanctum::actingAs($petani);

        $response = $this->postJson("/api/admin/tenant/{$tenant->tenant_id}/minta-akses");

        $response->assertStatus(403);
    }

    public function test_superadmin_tidak_bisa_mengajukan_dua_kali(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatSuperAdmin();
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/tenant/{$tenant->tenant_id}/minta-akses")->assertStatus(201);

        $response = $this->postJson("/api/admin/tenant/{$tenant->tenant_id}/minta-akses");

        $response->assertStatus(409);
    }

    public function test_superadmin_bisa_melihat_riwayat_permintaannya_sendiri(): void
    {
        $tenantSaya = $this->buatTenant();
        $tenantLain = $this->buatTenant();
        $admin      = $this->buatSuperAdmin();
        $adminLain  = $this->buatSuperAdmin();

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/tenant/{$tenantSaya->tenant_id}/minta-akses")->assertStatus(201);

        Sanctum::actingAs($adminLain);
        $this->postJson("/api/admin/tenant/{$tenantLain->tenant_id}/minta-akses")->assertStatus(201);

        Sanctum::actingAs($admin);
        $response = $this->getJson('/api/admin/akses-tenant/riwayat');

        $response->assertStatus(200)->assertJsonCount(1, 'data');
    }

    public function test_petani_bisa_melihat_daftar_permintaan_untuk_tenantnya(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatPetani($tenant);
        $admin  = $this->buatSuperAdmin();

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/tenant/{$tenant->tenant_id}/minta-akses")->assertStatus(201);

        Sanctum::actingAs($petani);
        $response = $this->getJson('/api/petani/akses-tenant');

        $response->assertStatus(200)->assertJsonCount(1, 'data');
    }

    public function test_petani_bisa_menyetujui_permintaan(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatPetani($tenant);
        $admin  = $this->buatSuperAdmin();

        $akses = AksesTenantAdmin::create([
            'tenant_id'    => $tenant->tenant_id,
            'admin_id'     => $admin->id,
            'status'       => 'pending',
            'diminta_pada' => now(),
        ]);

        Sanctum::actingAs($petani);
        $response = $this->patchJson("/api/petani/akses-tenant/{$akses->id}/setujui");

        $response->assertStatus(200)->assertJsonPath('data.status', 'disetujui');

        $this->assertDatabaseHas('akses_tenant_admins', [
            'id'              => $akses->id,
            'status'          => 'disetujui',
            'diputuskan_oleh' => $petani->id,
        ]);
    }

    public function test_petani_dari_tenant_lain_tidak_bisa_menyetujui(): void
    {
        $tenant     = $this->buatTenant();
        $tenantLain = $this->buatTenant();
        $petaniLain = $this->buatPetani($tenantLain);
        $admin      = $this->buatSuperAdmin();

        $akses = AksesTenantAdmin::create([
            'tenant_id'    => $tenant->tenant_id,
            'admin_id'     => $admin->id,
            'status'       => 'pending',
            'diminta_pada' => now(),
        ]);

        Sanctum::actingAs($petaniLain);
        $response = $this->patchJson("/api/petani/akses-tenant/{$akses->id}/setujui");

        $response->assertStatus(403);
    }

    public function test_petani_bisa_menolak_permintaan_dengan_alasan(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatPetani($tenant);
        $admin  = $this->buatSuperAdmin();

        $akses = AksesTenantAdmin::create([
            'tenant_id'    => $tenant->tenant_id,
            'admin_id'     => $admin->id,
            'status'       => 'pending',
            'diminta_pada' => now(),
        ]);

        Sanctum::actingAs($petani);
        $response = $this->patchJson("/api/petani/akses-tenant/{$akses->id}/tolak", [
            'alasan' => 'Belum perlu',
        ]);

        $response->assertStatus(200)->assertJsonPath('data.status', 'ditolak');
    }

    public function test_petani_bisa_mencabut_akses_yang_sudah_disetujui(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatPetani($tenant);
        $admin  = $this->buatSuperAdmin();

        $akses = AksesTenantAdmin::create([
            'tenant_id'       => $tenant->tenant_id,
            'admin_id'        => $admin->id,
            'status'          => 'disetujui',
            'diminta_pada'    => now(),
            'diputuskan_pada' => now(),
            'diputuskan_oleh' => $petani->id,
        ]);

        Sanctum::actingAs($petani);
        $response = $this->patchJson("/api/petani/akses-tenant/{$akses->id}/cabut");

        $response->assertStatus(200)->assertJsonPath('data.status', 'dicabut');
    }

    public function test_petani_tidak_bisa_mencabut_akses_yang_masih_pending(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatPetani($tenant);
        $admin  = $this->buatSuperAdmin();

        $akses = AksesTenantAdmin::create([
            'tenant_id'    => $tenant->tenant_id,
            'admin_id'     => $admin->id,
            'status'       => 'pending',
            'diminta_pada' => now(),
        ]);

        Sanctum::actingAs($petani);
        $response = $this->patchJson("/api/petani/akses-tenant/{$akses->id}/cabut");

        $response->assertStatus(409);
    }

    public function test_setujui_gagal_kalau_id_tidak_ada(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatPetani($tenant);
        Sanctum::actingAs($petani);

        $response = $this->patchJson('/api/petani/akses-tenant/' . Str::uuid() . '/setujui');

        $response->assertStatus(404);
    }

    public function test_tamu_tanpa_login_ditolak(): void
    {
        $tenant = $this->buatTenant();

        $response = $this->postJson("/api/admin/tenant/{$tenant->tenant_id}/minta-akses");

        $response->assertStatus(401);
    }
}