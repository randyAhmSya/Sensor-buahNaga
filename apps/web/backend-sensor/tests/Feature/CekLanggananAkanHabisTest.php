<?php

namespace Tests\Feature;

use App\Models\LanggananTenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class CekLanggananAkanHabisTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_tenant_dengan_sisa_hari_1_sampai_3_dapat_notifikasi(): void
    {
        $tenant = $this->buatTenant();
        LanggananTenant::create([
            'tenant_id' => $tenant->tenant_id,
            'status_langganan' => 'aktif',
            'sisa_hari' => 2,
            'tanggal_aktif_terakhir' => now(),
        ]);

        $this->artisan('langganan:cek-h3')->assertSuccessful();

        $this->assertDatabaseHas('notifikasis', [
            'tenant_id' => $tenant->tenant_id,
            'tipe' => 'langganan_akan_habis',
        ]);
    }

    public function test_tenant_dengan_sisa_hari_masih_banyak_tidak_dapat_notifikasi(): void
    {
        $tenant = $this->buatTenant();
        LanggananTenant::create([
            'tenant_id' => $tenant->tenant_id,
            'status_langganan' => 'aktif',
            'sisa_hari' => 10,
            'tanggal_aktif_terakhir' => now(),
        ]);

        $this->artisan('langganan:cek-h3');

        $this->assertDatabaseMissing('notifikasis', ['tenant_id' => $tenant->tenant_id]);
    }

    public function test_tenant_yang_sudah_kadaluarsa_tidak_dapat_notifikasi(): void
    {
        $tenant = $this->buatTenant();
        LanggananTenant::create([
            'tenant_id' => $tenant->tenant_id,
            'status_langganan' => 'kadaluarsa',
            'sisa_hari' => 5,
            'tanggal_aktif_terakhir' => now()->subDays(10), // sisa aktualnya udah 0, bukan 1-3
        ]);

        $this->artisan('langganan:cek-h3');

        $this->assertDatabaseMissing('notifikasis', ['tenant_id' => $tenant->tenant_id]);
    }

    public function test_tenant_nonaktif_tidak_dapat_notifikasi_walau_sisa_hari_pas(): void
    {
        $tenant = $this->buatTenant(['is_aktif' => false]);
        LanggananTenant::create([
            'tenant_id' => $tenant->tenant_id,
            'status_langganan' => 'aktif',
            'sisa_hari' => 2,
            'tanggal_aktif_terakhir' => now(),
        ]);

        $this->artisan('langganan:cek-h3');

        $this->assertDatabaseMissing('notifikasis', ['tenant_id' => $tenant->tenant_id]);
    }

    public function test_dijalankan_dua_kali_sehari_tidak_bikin_notifikasi_dobel(): void
    {
        $tenant = $this->buatTenant();
        LanggananTenant::create([
            'tenant_id' => $tenant->tenant_id,
            'status_langganan' => 'aktif',
            'sisa_hari' => 1,
            'tanggal_aktif_terakhir' => now(),
        ]);

        $this->artisan('langganan:cek-h3');
        $this->artisan('langganan:cek-h3');

        $this->assertDatabaseCount('notifikasis', 1);
    }
}