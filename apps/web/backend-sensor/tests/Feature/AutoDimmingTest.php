<?php

namespace Tests\Feature;

use App\Models\JadwalLampu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class AutoDimmingTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_dimming_dihitung_dan_tercatat_saat_dalam_jendela_nyala(): void
    {
        [$tenant, $node] = $this->siapkanNodeDenganJadwalAuto('00:00', '23:59', targetLux: 500, baseline: 70);

        $petani = $this->buatUser($tenant);
        Sanctum::actingAs($petani);

        $response = $this->postJson("/api/petani/sensor/{$node->id_sensor}/dimming", [
            'nilai_lux' => 250,
        ]);

        $response->assertStatus(200);
        // (500-250)/500 * 100 = 50%, di atas intensitas_minimum default (10)
        $response->assertJsonPath('data.presentase_redup', 50);

        $this->assertDatabaseHas('log_peredupans', [
            'sensor_id' => $node->id_sensor,
            'presentase_redup' => 50,
        ]);
    }

    public function test_dimming_dilewati_di_luar_jendela_nyala(): void
    {
        [$tenant, $node] = $this->siapkanNodeDenganJadwalAuto('03:00', '03:01', targetLux: 500, baseline: 70);

        $petani = $this->buatUser($tenant);
        Sanctum::actingAs($petani);

        $this->postJson("/api/petani/sensor/{$node->id_sensor}/dimming", ['nilai_lux' => 250])
            ->assertStatus(422);

        $this->assertDatabaseMissing('log_peredupans', ['sensor_id' => $node->id_sensor]);
    }

    public function test_dimming_tidak_boleh_turun_di_bawah_intensitas_minimum(): void
    {
        [$tenant, $node] = $this->siapkanNodeDenganJadwalAuto('00:00', '23:59', targetLux: 500, baseline: 70, intensitasMinimum: 20);

        $petani = $this->buatUser($tenant);
        Sanctum::actingAs($petani);

        // lux 500 = sama kayak target, mentah = 0%, tapi dibatasin minimum 20%
        $response = $this->postJson("/api/petani/sensor/{$node->id_sensor}/dimming", ['nilai_lux' => 500]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.presentase_redup', 20);
    }

    private function siapkanNodeDenganJadwalAuto(
        string $jamMulai,
        string $jamAkhir,
        float $targetLux,
        float $baseline,
        float $intensitasMinimum = 10
    ): array {
        $tenant = $this->buatTenant();
        $kebun = $this->buatKebun($tenant);
        $blok = $this->buatBlok($kebun);
        $gateway = $this->buatGateway($blok);
        $node = $this->buatNodeSensor($blok, $gateway);

        JadwalLampu::create([
            'kebun_id' => $kebun->id_kebun,
            'jam_mulai_nyala' => $jamMulai,
            'jam_akhir_nyala' => $jamAkhir,
            'mode' => 'auto',
            'target_lux' => $targetLux,
            'intensitas_minimum' => $intensitasMinimum,
            'baseline_manual_persen' => $baseline,
            'status_aktif' => true,
        ]);

        return [$tenant, $node];
    }
}