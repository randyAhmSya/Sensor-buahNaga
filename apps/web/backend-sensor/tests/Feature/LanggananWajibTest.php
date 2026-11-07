<?php

namespace Tests\Feature;

use App\Models\LanggananTenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class LanggananWajibTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    private function petaniDenganLanggananHabis()
    {
        config(['langganan.masa_tenggang_hari' => 0]);

        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);

        LanggananTenant::create([
            'tenant_id'              => $tenant->tenant_id,
            'status_langganan'       => 'trial',
            'sisa_hari'              => 1,
            'tanggal_aktif_terakhir' => now()->subDays(10),
        ]);

        return $petani;
    }

    public function test_langganan_habis_ditolak_402_saat_wajib(): void
    {
        config(['langganan.wajib' => true]);
        Sanctum::actingAs($this->petaniDenganLanggananHabis());

        $this->getJson('/api/petani/kebun')->assertStatus(402);
    }

    public function test_langganan_habis_tetap_boleh_saat_tidak_wajib(): void
    {
        config(['langganan.wajib' => false]);
        Sanctum::actingAs($this->petaniDenganLanggananHabis());

        $this->getJson('/api/petani/kebun')->assertOk();
    }

    public function test_tidak_wajib_tetap_menolak_akun_tanpa_tenant(): void
    {
        config(['langganan.wajib' => false]);
        Sanctum::actingAs($this->buatUser(null));

        // Dicegat middleware tenant sebelum sampai ke cek langganan.
        $this->getJson('/api/petani/kebun')->assertStatus(403);
    }

    public function test_tidak_wajib_tetap_menolak_tenant_nonaktif(): void
    {
        config(['langganan.wajib' => false]);
        $tenant = $this->buatTenant(['is_aktif' => false]);
        Sanctum::actingAs($this->buatUser($tenant));

        $this->getJson('/api/petani/kebun')->assertStatus(403);
    }
}