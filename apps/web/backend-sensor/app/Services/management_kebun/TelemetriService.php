<?php

namespace App\Services\management_kebun;

use App\Models\ReadSensor;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

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

    public const PER_PAGE_DEFAULT = 25;

    public const PER_PAGE_MAKS = 100;

    public function paginasiTelemetriBySensor(
        string $sensorId,
        int $page = 1,
        int $perPage = self::PER_PAGE_DEFAULT,
        ?string $dari = null,
        ?string $sampai = null
    ): LengthAwarePaginator {
        $perPage = max(1, min($perPage, self::PER_PAGE_MAKS));

        return ReadSensor::where('sensor_id', $sensorId)
            ->when($dari, fn ($q) => $q->where('dicatat_pada', '>=', $this->keZonaApp($dari)))
            ->when($sampai, fn ($q) => $q->where('dicatat_pada', '<=', $this->keZonaApp($sampai)))
            ->orderByDesc('dicatat_pada')
            ->paginate($perPage, ['*'], 'page', max(1, $page));
    }

    public const LIMIT_EKSPOR = 50000;

    public function untukEkspor(string $sensorId, ?string $dari = null, ?string $sampai = null)
    {
        return ReadSensor::where('sensor_id', $sensorId)
            ->when($dari, fn ($q) => $q->where('dicatat_pada', '>=', $this->keZonaApp($dari)))
            ->when($sampai, fn ($q) => $q->where('dicatat_pada', '<=', $this->keZonaApp($sampai)))
            ->orderByDesc('dicatat_pada')
            ->limit(self::LIMIT_EKSPOR)
            ->get();
    }

    private function keZonaApp(string $waktu): string
    {
        return Carbon::parse($waktu)
            ->setTimezone(config('app.timezone'))
            ->toDateTimeString();
    }
}
