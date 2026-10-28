<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use App\Models\JadwalLampu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * Sengaja memakai kebun TANPA blok/node, supaya update tidak memicu publish MQTT
 * (yang diuji di sini hanya cooldown slider dan pemetaan error).
 */
class JadwalUpdateTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    private function buatJadwalKebun(string $kebunId): JadwalLampu
    {
        return JadwalLampu::forceCreate([
            'kebun_id'           => $kebunId,
            'jam_mulai_nyala'    => '18:00:00',
            'jam_akhir_nyala'    => '05:00:00',
            'mode'               => 'manual',
            'instensitas_cahaya' => 80,
            'status_aktif'       => true,
        ]);
    }

    public function test_slider_kedua_dalam_cooldown_ditolak_429_dengan_retry_after(): void
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));
        $jadwal = $this->buatJadwalKebun($this->buatKebun($tenant)->id_kebun);

        $this->putJson("/api/petani/jadwal-lampu/{$jadwal->id_jadwal_lampu}", ['instensitas_cahaya' => 60])
            ->assertOk();

        $this->putJson("/api/petani/jadwal-lampu/{$jadwal->id_jadwal_lampu}", ['instensitas_cahaya' => 40])
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonPath('status', 'error');

        $this->assertEquals(60, $jadwal->fresh()->instensitas_cahaya);
    }

    public function test_cooldown_berlaku_per_jadwal_bukan_global(): void
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));
        $jadwalA = $this->buatJadwalKebun($this->buatKebun($tenant)->id_kebun);
        $jadwalB = $this->buatJadwalKebun($this->buatKebun($tenant)->id_kebun);

        $this->putJson("/api/petani/jadwal-lampu/{$jadwalA->id_jadwal_lampu}", ['instensitas_cahaya' => 60])->assertOk();
        $this->putJson("/api/petani/jadwal-lampu/{$jadwalB->id_jadwal_lampu}", ['instensitas_cahaya' => 50])->assertOk();
    }

    public function test_pindah_ke_auto_tanpa_baseline_ditolak_422(): void
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));
        $jadwal = $this->buatJadwalKebun($this->buatKebun($tenant)->id_kebun);

        $this->putJson("/api/petani/jadwal-lampu/{$jadwal->id_jadwal_lampu}", ['mode' => 'auto', 'target_lux' => 110])
            ->assertStatus(422)
            ->assertJsonPath('status', 'error');

        $this->assertSame('manual', $jadwal->fresh()->mode);
    }

    public function test_update_yang_ditolak_tidak_menghabiskan_cooldown(): void
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));
        $jadwal = $this->buatJadwalKebun($this->buatKebun($tenant)->id_kebun);

        // ditolak validasi mode (mode masih manual + ada instensitas_cahaya → cooldown "berlaku")
        $this->putJson("/api/petani/jadwal-lampu/{$jadwal->id_jadwal_lampu}", [
            'mode' => 'auto', 'target_lux' => 110, 'instensitas_cahaya' => 70,
        ])->assertStatus(422);

        // update sah berikutnya langsung boleh, tidak kena 429
        $this->putJson("/api/petani/jadwal-lampu/{$jadwal->id_jadwal_lampu}", ['instensitas_cahaya' => 55])
            ->assertOk();
    }

    public function test_pindah_ke_auto_lengkap_berhasil(): void
    {
        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));
        $jadwal = $this->buatJadwalKebun($this->buatKebun($tenant)->id_kebun);

        $this->putJson("/api/petani/jadwal-lampu/{$jadwal->id_jadwal_lampu}", [
            'mode' => 'auto', 'target_lux' => 110, 'baseline_manual_persen' => 80,
        ])->assertOk();

        $this->assertSame('auto', $jadwal->fresh()->mode);
    }
}