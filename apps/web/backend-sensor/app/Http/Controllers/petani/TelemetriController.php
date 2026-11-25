<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Models\Kebun;
use App\Models\NodeSensor;
use App\Services\management_kebun\TelemetriService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TelemetriController extends Controller
{
    use ApiResponser;

    protected TelemetriService $telemetriService;

    public function __construct(TelemetriService $telemetriService)
    {
        $this->telemetriService = $telemetriService;
    }

    public function index(Request $request): JsonResponse
    {
        $sensorId = $request->query('sensor_id');
        if (! $sensorId) {
            return $this->errorResponse('Parameter sensor_id wajib disertakan.', 400);
        }

        $sensor = NodeSensor::with('blok')->find($sensorId);
        if (! $sensor) {
            return $this->errorResponse('Node sensor tidak ditemukan.', 404);
        }

        $kebun = Kebun::find($sensor->blok->kebun_id);
        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse('Akses ditolak.', 403);
        }

        // Mode berhalaman (tabel log): aktif bila ada ?page atau ?per_page.
        if ($request->hasAny(['page', 'per_page', 'dari', 'sampai', 'ekspor'])) {
            $v = validator($request->query(), [
                'page' => 'sometimes|integer|min:1',
                'per_page' => 'sometimes|integer|min:1',
                'dari' => 'sometimes|nullable|date',
                'sampai' => 'sometimes|nullable|date|after_or_equal:dari',
            ]);
            if ($v->fails()) {
                return $this->errorResponse($v->errors()->first(), 422);
            }

            if ($request->boolean('ekspor')) {
                $baris = $this->telemetriService->untukEkspor(
                    $sensorId,
                    $request->query('dari') ?: null,
                    $request->query('sampai') ?: null
                );

                return $this->successResponse($baris, 'Data ekspor telemetri berhasil diambil.');
            }

            $hasil = $this->telemetriService->paginasiTelemetriBySensor(
                $sensorId,
                (int) $request->query('page', 1),
                (int) $request->query('per_page', TelemetriService::PER_PAGE_DEFAULT),
                $request->query('dari') ?: null,
                $request->query('sampai') ?: null
            );

            return $this->successResponse($hasil->items(), 'Data telemetri berhasil diambil.', 200, [
                'current_page' => $hasil->currentPage(),
                'last_page' => $hasil->lastPage(),
                'per_page' => $hasil->perPage(),
                'total' => $hasil->total(),
            ]);
        }

        $limit = (int) $request->query('limit', 100);
        $data = $this->telemetriService->getTelemetriBySensor($sensorId, $limit);

        return $this->successResponse($data, 'Data telemetri berhasil diambil.');
    }
}
