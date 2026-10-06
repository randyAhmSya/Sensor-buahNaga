<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Services\management_kebun\LogEnergyService;
use App\Models\NodeSensor;
use App\Models\Kebun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class LogEnergyController extends Controller
{
    use ApiResponser;

    protected LogEnergyService $logEnergyService;

    public function __construct(LogEnergyService $logEnergyService)
    {
        $this->logEnergyService = $logEnergyService;
    }

    public function index(Request $request): JsonResponse
    {
        $sensorId = $request->query('sensor_id');
        if (!$sensorId) return $this->errorResponse('Parameter sensor_id wajib disertakan.', 400);

        $sensor = NodeSensor::with('blok')->find($sensorId);
        if (!$sensor) return $this->errorResponse('Node sensor tidak ditemukan.', 404);

        $kebun = Kebun::find($sensor->blok->kebun_id);
        if (Gate::denies('view', $kebun)) return $this->errorResponse('Akses ditolak.', 403);

        $limit = (int) $request->query('limit', 100);

        $riwayat = $this->logEnergyService->getRiwayatBySensor($sensorId, $limit);
        $totalKwh = $this->logEnergyService->getTotalKwhBySensor($sensorId);

        return $this->successResponse([
            'total_kwh' => $totalKwh,
            'riwayat'   => $riwayat,
        ], 'Data konsumsi energi berhasil diambil.');
    }
}