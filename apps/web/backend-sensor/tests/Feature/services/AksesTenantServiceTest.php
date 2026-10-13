<?php

namespace Tests\Feature\management_admin;

use App\Models\Tenant;
use App\Models\User;
use App\Services\management_admin\AksesTenantService;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AksesTenantServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AksesTenantService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AksesTenantService();
    }

    protected function buatTenant(array $overrides = []): Tenant
    {
        return Tenant::create(array_merge([
            'tenant_id'   => (string) Str::uuid(),
            'nama_tenant' => 'Tenant Uji ' . Str::random(5),
        ], $overrides));
    }

    protected function buatUser(array $overrides = []): User
    {
        return User::create(array_merge([
            'nama_lengkap' => 'User Uji ' . Str::random(5),
            'email'        => Str::random(10) . '@test.local',
            'password'     => 'password123',
            'role'         => 'superAdmin',
        ], $overrides));
    }

    protected function buatPetani(Tenant $tenant, array $overrides = []): User
    {
        return $this->buatUser(array_merge([
            'tenant_id' => $tenant->tenant_id,
            'role'      => 'petani',
        ], $overrides));
    }

    public function test_ajukan_membuat_akses_berstatus_pending(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatUser();

        $akses = $this->service->ajukan($tenant->tenant_id, $admin->id, 'Perlu cek sensor');

        $this->assertDatabaseHas('akses_tenant_admins', [
            'id'                => $akses->id,
            'tenant_id'         => $tenant->tenant_id,
            'admin_id'          => $admin->id,
            'status'            => 'pending',
            'alasan_permintaan' => 'Perlu cek sensor',
        ]);
    }

    public function test_ajukan_gagal_kalau_sudah_ada_yang_pending_atau_disetujui(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatUser();

        $this->service->ajukan($tenant->tenant_id, $admin->id);

        $this->expectException(DomainException::class);
        $this->service->ajukan($tenant->tenant_id, $admin->id);
    }

    public function test_setujui_mengubah_status_jadi_disetujui_dan_mencatat_penentu(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatUser();
        $petani = $this->buatPetani($tenant);
        $akses  = $this->service->ajukan($tenant->tenant_id, $admin->id);

        $hasil = $this->service->setujui($akses->id, $petani);

        $this->assertEquals('disetujui', $hasil->status);
        $this->assertEquals($petani->id, $hasil->diputuskan_oleh);
        $this->assertNotNull($hasil->diputuskan_pada);
    }

    public function test_setujui_gagal_kalau_petani_bukan_pemilik_tenant(): void
    {
        $tenant     = $this->buatTenant();
        $tenantLain = $this->buatTenant();
        $admin      = $this->buatUser();
        $petaniLain = $this->buatPetani($tenantLain);
        $akses      = $this->service->ajukan($tenant->tenant_id, $admin->id);

        $this->expectException(AuthorizationException::class);
        $this->service->setujui($akses->id, $petaniLain);
    }

    public function test_setujui_gagal_kalau_status_bukan_pending(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatUser();
        $petani = $this->buatPetani($tenant);
        $akses  = $this->service->ajukan($tenant->tenant_id, $admin->id);
        $this->service->setujui($akses->id, $petani);

        $this->expectException(DomainException::class);
        $this->service->setujui($akses->id, $petani);
    }

    public function test_setujui_gagal_kalau_id_tidak_ditemukan(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatPetani($tenant);

        $this->expectException(ModelNotFoundException::class);
        $this->service->setujui((string) Str::uuid(), $petani);
    }

    public function test_tolak_mengubah_status_jadi_ditolak_dengan_alasan(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatUser();
        $petani = $this->buatPetani($tenant);
        $akses  = $this->service->ajukan($tenant->tenant_id, $admin->id, 'Perlu cek sensor');

        $hasil = $this->service->tolak($akses->id, $petani, 'Belum perlu akses superadmin');

        $this->assertEquals('ditolak', $hasil->status);
        $this->assertEquals('Perlu cek sensor', $hasil->alasan_permintaan);
        $this->assertEquals('Belum perlu akses superadmin', $hasil->alasan_penolakan);
    }

    public function test_tolak_gagal_kalau_petani_bukan_pemilik_tenant(): void
    {
        $tenant     = $this->buatTenant();
        $tenantLain = $this->buatTenant();
        $admin      = $this->buatUser();
        $petaniLain = $this->buatPetani($tenantLain);
        $akses      = $this->service->ajukan($tenant->tenant_id, $admin->id);

        $this->expectException(AuthorizationException::class);
        $this->service->tolak($akses->id, $petaniLain);
    }

    public function test_cabut_mengubah_status_disetujui_jadi_dicabut(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatUser();
        $petani = $this->buatPetani($tenant);
        $akses  = $this->service->ajukan($tenant->tenant_id, $admin->id);
        $this->service->setujui($akses->id, $petani);

        $hasil = $this->service->cabut($akses->id, $petani);

        $this->assertEquals('dicabut', $hasil->status);
        $this->assertEquals($petani->id, $hasil->diputuskan_oleh);
    }

    public function test_cabut_gagal_kalau_status_belum_disetujui(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatUser();
        $petani = $this->buatPetani($tenant);
        $akses  = $this->service->ajukan($tenant->tenant_id, $admin->id);

        $this->expectException(DomainException::class);
        $this->service->cabut($akses->id, $petani);
    }

    public function test_boleh_akses_true_hanya_kalau_status_disetujui(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatUser();
        $petani = $this->buatPetani($tenant);

        $this->assertFalse($this->service->bolehAkses($tenant->tenant_id, $admin->id));

        $akses = $this->service->ajukan($tenant->tenant_id, $admin->id);
        $this->assertFalse($this->service->bolehAkses($tenant->tenant_id, $admin->id));

        $this->service->setujui($akses->id, $petani);
        $this->assertTrue($this->service->bolehAkses($tenant->tenant_id, $admin->id));
    }

    public function test_pastikan_boleh_akses_melempar_exception_kalau_belum_diizinkan(): void
    {
        $tenant = $this->buatTenant();
        $admin  = $this->buatUser();

        $this->expectException(AuthorizationException::class);
        $this->service->pastikanBolehAkses($tenant->tenant_id, $admin->id);
    }

    public function test_riwayat_tenant_hanya_berisi_akses_tenant_itu(): void
    {
        $tenant     = $this->buatTenant();
        $tenantLain = $this->buatTenant();
        $admin      = $this->buatUser();
        $adminLain  = $this->buatUser();

        $this->service->ajukan($tenant->tenant_id, $admin->id);
        $this->service->ajukan($tenantLain->tenant_id, $adminLain->id);

        $riwayat = $this->service->riwayatTenant($tenant->tenant_id);

        $this->assertCount(1, $riwayat);
        $this->assertEquals($tenant->tenant_id, $riwayat->first()->tenant_id);
    }

    public function test_riwayat_admin_hanya_berisi_akses_admin_itu(): void
    {
        $tenant    = $this->buatTenant();
        $admin     = $this->buatUser();
        $adminLain = $this->buatUser();

        $this->service->ajukan($tenant->tenant_id, $admin->id);
        $this->service->ajukan($this->buatTenant()->tenant_id, $adminLain->id);

        $riwayat = $this->service->riwayatAdmin($admin->id);

        $this->assertCount(1, $riwayat);
        $this->assertEquals($admin->id, $riwayat->first()->admin_id);
    }
}