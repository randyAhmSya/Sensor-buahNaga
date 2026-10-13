<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Services\management_kebun\AutoDimmingService;
use App\Models\NodeSensor;
use App\Models\Kebun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class AutoDimmingController extends Controller
{
    use ApiResponser;

    protected AutoDimmingService $dimmingService;

    public function __construct(AutoDimmingService $dimmingService)
    {
        $this->dimmingService = $dimmingService;
    }

    /**
     * Endpoint buat testing/simulasi perhitungan auto dimming lewat Bruno/Postman.
     * Nantinya di produksi, ini yang bakal dipanggil dari alur gateway kirim data lux
     * (lewat MQTT atau HTTP, tergantung desain yang dipilih nanti).
     */
    public function hitung(Request $request, string $sensorId): JsonResponse
    {
        $request->validate([
            'nilai_lux'  => 'required|numeric|min:0',
            'fase_bulan' => 'nullable|string',
        ]);

        $sensor = NodeSensor::with('blok')->find($sensorId);
        if (!$sensor) {
            return $this->errorResponse('Node sensor tidak ditemukan.', 404);
        }

        $kebun = Kebun::find($sensor->blok->kebun_id);
        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse('Akses ditolak.', 403);
        }

        $result = $this->dimmingService->hitungDanCatat($sensorId, (float) $request->nilai_lux, $request->fase_bulan);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse($result['data'], 'Perhitungan auto dimming berhasil dicatat.');
    }
}