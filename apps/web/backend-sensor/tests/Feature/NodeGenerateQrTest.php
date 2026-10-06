<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class NodeGenerateQrTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_petani_tenant_lain_ditolak_generate_qr_node_tenant_lain(): void
    {
        $tenantPemilik = $this->buatTenant();
        $kebun = $this->buatKebun($tenantPemilik);
        $blok = $this->buatBlok($kebun);
        $gateway = $this->buatGateway($blok);
        $node = $this->buatNodeSensor($blok, $gateway);

        $tenantPenyerang = $this->buatTenant();
        $penyerang = $this->buatUser($tenantPenyerang);
        Sanctum::actingAs($penyerang);

        $this->postJson("/api/petani/node/{$node->id_sensor}/generate-qr")
            ->assertStatus(403);
    }

    public function test_petani_pemilik_bisa_generate_qr_node_miliknya(): void
    {
        $tenant = $this->buatTenant();
        $kebun = $this->buatKebun($tenant);
        $blok = $this->buatBlok($kebun);
        $gateway = $this->buatGateway($blok);
        $node = $this->buatNodeSensor($blok, $gateway);

        $pemilik = $this->buatUser($tenant);
        Sanctum::actingAs($pemilik);

        $this->postJson("/api/petani/node/{$node->id_sensor}/generate-qr")
            ->assertStatus(200);
    }
}