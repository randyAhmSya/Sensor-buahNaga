<?php

namespace Tests\Feature;

use App\Models\NodeSensor;
use App\Services\management_kebun\TelemetriProcessorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class TelemetriProcessorTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_telemetri_ditolak_kalau_sensor_id_bukan_milik_gateway_di_topic(): void
    {
        $nodeA = $this->buatNodeSensorLengkap('GATEWAY-A');
        $this->buatNodeSensorLengkap('GATEWAY-B');

        $hasil = app(TelemetriProcessorService::class)->prosesTelemetri(
            'agrolight/GATEWAY-B/telemetri',
            json_encode(['sensor_id' => $nodeA->id_sensor, 'nilai_lux' => 500, 'suhu' => 28])
        );

        $this->assertFalse($hasil['success']);
        $this->assertDatabaseMissing('read__sensors', ['sensor_id' => $nodeA->id_sensor]);
    }

    public function test_telemetri_diterima_kalau_sensor_id_beneran_milik_gateway_di_topic(): void
    {
        $node = $this->buatNodeSensorLengkap('GATEWAY-SAH');

        $hasil = app(TelemetriProcessorService::class)->prosesTelemetri(
            'agrolight/GATEWAY-SAH/telemetri',
            json_encode(['sensor_id' => $node->id_sensor, 'nilai_lux' => 500, 'suhu' => 28])
        );

        $this->assertTrue($hasil['success']);
        $this->assertDatabaseHas('read__sensors', ['sensor_id' => $node->id_sensor]);
    }

    public function test_energi_ditolak_kalau_sensor_id_bukan_milik_gateway_di_topic(): void
    {
        $nodeA = $this->buatNodeSensorLengkap('GATEWAY-ENERGI-A');
        $this->buatNodeSensorLengkap('GATEWAY-ENERGI-B');

        $hasil = app(TelemetriProcessorService::class)->prosesEnergi(
            'agrolight/GATEWAY-ENERGI-B/energi',
            json_encode(['sensor_id' => $nodeA->id_sensor, 'konsumsi_watt' => 45])
        );

        $this->assertFalse($hasil['success']);
        $this->assertDatabaseMissing('log_energies', ['sensor_id' => $nodeA->id_sensor]);
    }

    public function test_payload_dengan_sensor_id_bukan_uuid_ditolak_tanpa_exception(): void
    {
        $this->buatNodeSensorLengkap('GATEWAY-NGACO');

        $hasil = app(TelemetriProcessorService::class)->prosesTelemetri(
            'agrolight/GATEWAY-NGACO/telemetri',
            json_encode(['sensor_id' => 'bukan-uuid', 'nilai_lux' => 100])
        );

        $this->assertFalse($hasil['success']);
    }

    public function test_payload_energi_watt_negatif_ditolak(): void
    {
        $node = $this->buatNodeSensorLengkap('GATEWAY-WATT-MINUS');

        $hasil = app(TelemetriProcessorService::class)->prosesEnergi(
            'agrolight/GATEWAY-WATT-MINUS/energi',
            json_encode(['sensor_id' => $node->id_sensor, 'konsumsi_watt' => -10])
        );

        $this->assertFalse($hasil['success']);
        $this->assertDatabaseMissing('log_energies', ['sensor_id' => $node->id_sensor]);
    }

    private function buatNodeSensorLengkap(string $kodeGateway): NodeSensor
    {
        $tenant = $this->buatTenant();
        $kebun = $this->buatKebun($tenant);
        $blok = $this->buatBlok($kebun);
        $gateway = $this->buatGateway($blok, ['kode_perangkat' => $kodeGateway]);
        return $this->buatNodeSensor($blok, $gateway);
    }
}