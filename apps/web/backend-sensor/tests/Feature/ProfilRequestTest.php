<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class ProfilRequestTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_header_server_timing_muncul_saat_profil_aktif(): void
    {
        config(['profil.aktif' => true]);
        Sanctum::actingAs($this->buatUser($this->buatTenant()));

        $res = $this->getJson('/api/petani/langganan/paket')->assertOk();

        $this->assertStringContainsString('db;dur=', (string) $res->headers->get('Server-Timing'));
    }

    public function test_tidak_ada_header_saat_profil_mati(): void
    {
        config(['profil.aktif' => false]);
        Sanctum::actingAs($this->buatUser($this->buatTenant()));

        $this->getJson('/api/petani/langganan/paket')
            ->assertOk()
            ->assertHeaderMissing('Server-Timing');
    }
}