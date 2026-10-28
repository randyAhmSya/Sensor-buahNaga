<?php

namespace App\Services\management_kebun;

use App\Models\Gateway;
use App\Models\LogEnergy;
use App\Models\NodeSensor;
use App\Models\ReadSensor;
use Carbon\Carbon;
use Illuminate\Support\Str;

class TelemetriProcessorService
{
    // Penanda "terakhir terlihat" tidak perlu ditulis tiap pesan; batas offline 90 detik,
    // jadi cukup diperbarui paling sering sekali per 15 detik.
    private const THROTTLE_TERLIHAT_DETIK = 15;

    public function __construct(protected AutoDimmingService $autoDimmingService)
    {
    }

    public function cariSensorMilikGateway(string $topic, mixed $sensorId): ?NodeSensor
    {
        $kodePerangkat = explode('/', $topic)[1] ?? null;

        if (!$kodePerangkat || !is_string($sensorId) || !Str::isUuid($sensorId)) {
            return null;
        }

        return NodeSensor::where('id_sensor', $sensorId)
            ->whereIn('gateway_id', Gateway::where('kode_perangkat', $kodePerangkat)->select('id_gateway'))
            ->first();
    }

    public function prosesTelemetri(string $topic, string $message): array
    {
        $data = json_decode($message, true);

        if (!is_array($data)) {
            return ['success' => false, 'message' => 'payload bukan JSON valid'];
        }

        $sensor = $this->cariSensorMilikGateway($topic, $data['sensor_id'] ?? null);

        if (!$sensor) {
            return ['success' => false, 'message' => 'sensor_id nggak valid atau bukan milik gateway ini'];
        }

        $this->tandaiTerlihat($sensor);

        $lux = isset($data['nilai_lux']) && is_numeric($data['nilai_lux']) ? (float) $data['nilai_lux'] : null;
        $suhu = isset($data['suhu']) && is_numeric($data['suhu']) ? (float) $data['suhu'] : null;

        ReadSensor::create([
            'sensor_id' => $sensor->id_sensor,
            'nilai_lux' => $lux,
            'suhu' => $suhu,
            'dicatat_pada' => now(),
        ]);

        $dimming = null;
        if ($lux !== null && $lux >= 0) {
            $dimming = $this->autoDimmingService->hitungDanCatat($sensor->id_sensor, $lux, $data['fase_bulan'] ?? null);
        }

        return ['success' => true, 'sensor_id' => $sensor->id_sensor, 'dimming' => $dimming];
    }

    public function prosesEnergi(string $topic, string $message): array
    {
        $data = json_decode($message, true);

        if (!is_array($data) || !isset($data['konsumsi_watt']) || !is_numeric($data['konsumsi_watt']) || $data['konsumsi_watt'] < 0) {
            return ['success' => false, 'message' => 'payload nggak valid'];
        }

        $sensor = $this->cariSensorMilikGateway($topic, $data['sensor_id'] ?? null);

        if (!$sensor) {
            return ['success' => false, 'message' => 'sensor_id nggak valid atau bukan milik gateway ini'];
        }
    
        $this->tandaiTerlihat($sensor);

        LogEnergy::create([
            'sensor_id' => $sensor->id_sensor,
            'konsumsi_watt' => (float) $data['konsumsi_watt'],
            'dicatat_pada' => now(),
        ]);

        return ['success' => true, 'sensor_id' => $sensor->id_sensor];
    }

    /**
     * Catat bahwa node (dan gateway-nya) baru saja mengirim data yang valid.
     * Dipakai untuk status online/offline di dashboard.
     */
    protected function tandaiTerlihat(NodeSensor $sensor): void
    {
        $terakhir = $sensor->terakhir_terlihat ? Carbon::parse($sensor->terakhir_terlihat) : null;

        if ($terakhir && $terakhir->greaterThan(now()->subSeconds(self::THROTTLE_TERLIHAT_DETIK))) {
            return;
        }

        $sekarang = now();

        $sensor->forceFill(['terakhir_terlihat' => $sekarang])->save();
        Gateway::where('id_gateway', $sensor->gateway_id)->update(['terakhir_terlihat' => $sekarang]);
    }
}