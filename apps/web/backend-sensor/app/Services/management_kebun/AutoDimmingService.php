<?php

namespace App\Services\management_kebun;

use App\Models\LogPeredupan;
use App\Models\NodeSensor;

class AutoDimmingService
{
    public function __construct(
        protected JadwalLampuService $jadwalService,
        protected MqttPublisherService $mqttPublisher,
    ) {
    }

    public function hitungDanCatat(string $sensorId, float $nilaiLux, ?string $faseBulan = null): array
    {
        $jadwal = $this->jadwalService->resolveJadwalAktifUntukSensor($sensorId);

        if (!$jadwal) {
            return ['success' => false, 'message' => 'Tidak ada jadwal lampu aktif untuk node ini.'];
        }

        if ($jadwal->mode !== 'auto') {
            return ['success' => false, 'message' => 'Jadwal yang aktif untuk node ini mode manual, bukan auto dimming.'];
        }

        if (!$this->jadwalService->sedangDalamJendelaNyala($jadwal)) {
            return ['success' => false, 'message' => 'Di luar jam nyala lampu, perhitungan dimming dilewati.'];
        }

        $targetLux = (float) $jadwal->target_lux;
        $minimum = (float) ($jadwal->intensitas_minimum ?? 10);

        $mentah = (($targetLux - $nilaiLux) / $targetLux) * 100;
        $persentase = max($minimum, min(100, $mentah));

        $log = LogPeredupan::create([
            'sensor_id'        => $sensorId,
            'presentase_redup' => round($persentase, 2),
            'nilai_lux'        => $nilaiLux,
            'fase_bulan'       => $faseBulan,
            'dicatat_pada'     => now(),
        ]);

        $sensor = NodeSensor::find($sensorId);
        if ($sensor) {
            $this->mqttPublisher->publishDimming($sensor, $persentase);
        }

        return ['success' => true, 'data' => $log];
    }
}