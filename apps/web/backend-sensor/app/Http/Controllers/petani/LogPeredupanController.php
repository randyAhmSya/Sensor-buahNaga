<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Models\Kebun;
use App\Models\NodeSensor;
use App\Services\management_kebun\LogPeredupanService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LogPeredupanController extends Controller
{
    use ApiResponser;

    public function __construct(protected LogPeredupanService $logPeredupanService) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'sensor_id'      => 'required|uuid',
            'jam'            => 'nullable|integer|min:1|max:' . LogPeredupanService::JAM_MAKS,
            'interval_menit' => 'nullable|integer|min:1|max:' . LogPeredupanService::INTERVAL_MAKS_MENIT,
        ]);

        $sensor = NodeSensor::with('blok')->find($request->query('sensor_id'));
        if (!$sensor || !$sensor->blok) {
            return $this->errorResponse('Node sensor tidak ditemukan.', 404);
        }

        $kebun = Kebun::find($sensor->blok->kebun_id);
        if (!$kebun || Gate::denies('view', $kebun)) {
            return $this->errorResponse('Akses ditolak.', 403);
        }

        $hasil = $this->logPeredupanService->riwayat(
            $sensor->id_sensor,
            (int) $request->query('jam', LogPeredupanService::JAM_DEFAULT),
            (int) $request->query('interval_menit', LogPeredupanService::INTERVAL_DEFAULT_MENIT),
        );

        return $this->successResponse($hasil, 'Riwayat auto-dimming berhasil diambil.');
    }
}