<?php

namespace Tests\Feature;

use App\Services\management_kebun\BlokStatusService;
use App\Services\management_kebun\TelemetriProcessorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class TerakhirTerlihatTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    private function siapkan(): array
    {
        $blok = $this->buatBlok($this->buatKebun($this->buatTenant()));
        $gateway = $this->buatGateway($blok);
        $node = $this->buatNodeSensor($blok, $gateway);

        return [$blok, $gateway, $node];
    }

    private function topic($gateway, string $jenis): string
    {
        return "agrolight/{$gateway->kode_perangkat}/{$jenis}";
    }

    public function test_telemetri_valid_menandai_node_dan_gateway_terlihat(): void
    {
        [, $gateway, $node] = $this->siapkan();
        $this->assertNull($node->fresh()->terakhir_terlihat);

        app(TelemetriProcessorService::class)->prosesTelemetri(
            $this->topic($gateway, 'telemetri'),
            json_encode(['sensor_id' => $node->id_sensor, 'nilai_lux' => 10, 'suhu' => 27])
        );

        $this->assertNotNull($node->fresh()->terakhir_terlihat);
        $this->assertNotNull($gateway->fresh()->terakhir_terlihat);
    }

    public function test_energi_valid_juga_menandai_terlihat(): void
    {
        [, $gateway, $node] = $this->siapkan();

        app(TelemetriProcessorService::class)->prosesEnergi(
            $this->topic($gateway, 'energi'),
            json_encode(['sensor_id' => $node->id_sensor, 'konsumsi_watt' => 120])
        );

        $this->assertNotNull($node->fresh()->terakhir_terlihat);
    }

    public function test_payload_ditolak_tidak_menandai_terlihat(): void
    {
        [, $gateway, $node] = $this->siapkan();
        [, $gatewayLain] = $this->siapkan();

        // sensor_id milik gateway lain → ditolak, node tidak boleh ditandai terlihat
        app(TelemetriProcessorService::class)->prosesTelemetri(
            $this->topic($gatewayLain, 'telemetri'),
            json_encode(['sensor_id' => $node->id_sensor, 'nilai_lux' => 10])
        );

        $this->assertNull($node->fresh()->terakhir_terlihat);
        $this->assertNull($gateway->fresh()->terakhir_terlihat);
    }

    public function test_status_blok_online_setelah_telemetri_dan_belum_pernah_sebelumnya(): void
    {
        [$blok, $gateway, $node] = $this->siapkan();
        $service = app(BlokStatusService::class);

        $sebelum = $service->getRingkasanBlok($blok->id_blok);
        $this->assertSame(0, $sebelum['jumlah_online']);
        $this->assertSame('belum_pernah_terlihat', $sebelum['nodes'][0]['status']);

        app(TelemetriProcessorService::class)->prosesTelemetri(
            $this->topic($gateway, 'telemetri'),
            json_encode(['sensor_id' => $node->id_sensor, 'nilai_lux' => 10])
        );

        $sesudah = $service->getRingkasanBlok($blok->id_blok);
        $this->assertSame(1, $sesudah['jumlah_online']);
        $this->assertSame('online', $sesudah['nodes'][0]['status']);
    }

    public function test_status_blok_offline_kalau_lewat_batas(): void
    {
        [$blok, , $node] = $this->siapkan();
        $node->forceFill(['terakhir_terlihat' => now()->subMinutes(5)])->save();

        $hasil = app(BlokStatusService::class)->getRingkasanBlok($blok->id_blok);

        $this->assertSame(0, $hasil['jumlah_online']);
        $this->assertSame(1, $hasil['jumlah_offline']);
        $this->assertSame('offline', $hasil['nodes'][0]['status']);
    }
}