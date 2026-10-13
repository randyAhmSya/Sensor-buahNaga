<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\jadwalLampu\addJadwalLampuRequest;
use App\Http\Requests\jadwalLampu\updateJadwalLampuRequest;
use App\Services\management_kebun\JadwalLampuService;
use App\Models\Kebun;
use App\Models\NodeSensor;
use App\Models\JadwalLampu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class JadwalLampuController extends Controller
{
    use ApiResponser;

    private const PESAN_AKSES_DITOLAK = 'Akses ditolak.';
    private const PESAN_SENSOR_TIDAK_DITEMUKAN = 'Node sensor tidak ditemukan.';
    private const PESAN_JADWAL_TIDAK_DITEMUKAN = 'Data jadwal lampu tidak ditemukan.';

    protected JadwalLampuService $jadwalService;

    public function __construct(JadwalLampuService $jadwalService)
    {
        $this->jadwalService = $jadwalService;
    }

    public function index(Request $request): JsonResponse
    {
        $kebunId = $request->query('kebun_id');
        $sensorId = $request->query('sensor_id');

        if (!$kebunId && !$sensorId) {
            return $this->errorResponse('Parameter kebun_id atau sensor_id wajib disertakan.', 400);
        }

        if ($kebunId) {
            $kebun = Kebun::find($kebunId);
            if (!$kebun) {
                return $this->errorResponse('Data kebun tidak ditemukan.', 404);
            }
            if (Gate::denies('view', $kebun)) {
                return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
            }

            $jadwalList = $this->jadwalService->getAllJadwalByKebun($kebunId);
        } else {
            $sensor = NodeSensor::with('blok')->find($sensorId);
            if (!$sensor) {
                return $this->errorResponse(self::PESAN_SENSOR_TIDAK_DITEMUKAN, 404);
            }

            $kebun = Kebun::find($sensor->blok->kebun_id);
            if (Gate::denies('view', $kebun)) {
                return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
            }

            $jadwalList = $this->jadwalService->getAllJadwalBySensor($sensorId);
        }

        return $this->successResponse($jadwalList, 'Data jadwal lampu berhasil diambil.');
    }

    public function aktif(Request $request): JsonResponse
    {
        $sensorId = $request->query('sensor_id');
        if (!$sensorId) {
            return $this->errorResponse('Parameter sensor_id wajib disertakan.', 400);
        }

        $sensor = NodeSensor::with('blok')->find($sensorId);
        if (!$sensor) {
            return $this->errorResponse(self::PESAN_SENSOR_TIDAK_DITEMUKAN, 404);
        }

        $kebun = Kebun::find($sensor->blok->kebun_id);
        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
        }

        $jadwal = $this->jadwalService->resolveJadwalAktifUntukSensor($sensorId);
        if (!$jadwal) {
            return $this->errorResponse('Belum ada jadwal aktif (default kebun maupun override) untuk node ini.', 404);
        }

        return $this->successResponse($jadwal, 'Jadwal lampu aktif berhasil diambil.');
    }

    public function store(addJadwalLampuRequest $request): JsonResponse
    {
        if ($request->kebun_id) {
            $kebun = Kebun::find($request->kebun_id);
        } else {
            $sensor = NodeSensor::with('blok')->find($request->sensor_id);
            if (!$sensor) {
                return $this->errorResponse(self::PESAN_SENSOR_TIDAK_DITEMUKAN, 404);
            }
            $kebun = Kebun::find($sensor->blok->kebun_id);
        }

        if (!$kebun) {
            return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        }
        if (Gate::denies('update', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki izin.', 403);
        }

        $jadwal = $this->jadwalService->createJadwal($request->validated());
        return $this->successResponse($jadwal, 'Jadwal lampu berhasil dibuat dan diaktifkan.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $jadwal = $this->jadwalService->getJadwalById($id);
        if (!$jadwal) {
            return $this->errorResponse(self::PESAN_JADWAL_TIDAK_DITEMUKAN, 404);
        }

        $kebun = $this->resolveKebunFromJadwal($jadwal);
        if (!$kebun || Gate::denies('view', $kebun)) {
            return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
        }

        return $this->successResponse($jadwal, 'Detail jadwal lampu berhasil diambil.');
    }

    public function update(updateJadwalLampuRequest $request, string $id): JsonResponse
    {
        $jadwal = $this->jadwalService->getJadwalById($id);
        if (!$jadwal) {
            return $this->errorResponse(self::PESAN_JADWAL_TIDAK_DITEMUKAN, 404);
        }

        $kebun = $this->resolveKebunFromJadwal($jadwal);
        if (!$kebun || Gate::denies('update', $kebun)) {
            return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
        }

        $updatedJadwal = $this->jadwalService->updateJadwal($jadwal, $request->validated());
        return $this->successResponse($updatedJadwal, 'Data jadwal lampu berhasil diperbarui.');
    }

    public function destroy(string $id): JsonResponse
    {
        $jadwal = $this->jadwalService->getJadwalById($id);
        if (!$jadwal) {
            return $this->errorResponse(self::PESAN_JADWAL_TIDAK_DITEMUKAN, 404);
        }

        $kebun = $this->resolveKebunFromJadwal($jadwal);
        if (!$kebun || Gate::denies('delete', $kebun)) {
            return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
        }

        $this->jadwalService->deleteJadwal($jadwal);
        return $this->successResponse(null, 'Jadwal lampu berhasil dihapus.');
    }

    private function resolveKebunFromJadwal(JadwalLampu $jadwal): ?Kebun
    {
        if ($jadwal->kebun_id) {
            return Kebun::find($jadwal->kebun_id);
        }

        $sensor = NodeSensor::with('blok')->find($jadwal->sensor_id);
        return $sensor && $sensor->blok ? Kebun::find($sensor->blok->kebun_id) : null;
    }
}