<?php
 
namespace App\Services\management_kebun;
 
use App\Models\ReadSensor;
 
class TelemetriService
{
    public const LIMIT_MAKS = 1000;
    public function getTelemetriBySensor(string $sensorId, int $limit = 100)
    {

        $limit = max(1, min($limit, self::LIMIT_MAKS));

        return ReadSensor::where('sensor_id', $sensorId)
            ->orderByDesc('dicatat_pada')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }
}
 
