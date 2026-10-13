<?php
 
namespace App\Services\management_kebun;
 
use App\Models\ReadSensor;
 
class TelemetriService
{
    public function getTelemetriBySensor(string $sensorId, int $limit = 100)
    {
        return ReadSensor::where('sensor_id', $sensorId)
            ->orderByDesc('dicatat_pada')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }
}
 
