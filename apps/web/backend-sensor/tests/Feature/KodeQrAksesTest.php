<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class KodeQrAksesTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_petani_tidak_bisa_update_qr(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $qr = $this->buatKodeQr();

        Sanctum::actingAs($petani);

        $this->putJson("/api/petani/qr/{$qr->id_qr}", ['status_qr' => false])
            ->assertStatus(405);
    }

    public function test_petani_tidak_bisa_hapus_qr(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $qr = $this->buatKodeQr();

        Sanctum::actingAs($petani);

        $this->deleteJson("/api/petani/qr/{$qr->id_qr}")
            ->assertStatus(405);
    }

    public function test_superadmin_bisa_update_qr(): void
    {
        $superAdmin = $this->buatUser(role: 'superAdmin');
        $qr = $this->buatKodeQr();

        Sanctum::actingAs($superAdmin);

        $this->putJson("/api/admin/qr/{$qr->id_qr}", ['status_qr' => false])
            ->assertStatus(200);
    }

    public function test_superadmin_bisa_hapus_qr(): void
    {
        $superAdmin = $this->buatUser(role: 'superAdmin');
        $qr = $this->buatKodeQr();

        Sanctum::actingAs($superAdmin);

        $this->deleteJson("/api/admin/qr/{$qr->id_qr}")
            ->assertStatus(200);
    }
}