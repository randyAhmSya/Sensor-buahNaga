<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Models\Kebun;
use App\Services\management_kebun\JadwalRingkasanService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class JadwalRingkasanController extends Controller
{
    use ApiResponser;

    private const PER_PAGE_DEFAULT = 15;
    private const PER_PAGE_MAKS = 100;

    protected JadwalRingkasanService $ringkasanService;

    public function __construct(JadwalRingkasanService $ringkasanService)
    {
        $this->ringkasanService = $ringkasanService;
    }

    public function index(Request $request): JsonResponse
    {
        $kebunId = $request->query('kebun_id');
        if (!$kebunId) {
            return $this->errorResponse('Parameter kebun_id wajib disertakan.', 400);
        }

        $kebun = Kebun::find($kebunId);
        if (!$kebun) {
            return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        }
        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse('Akses ditolak.', 403);
        }

        $perPage = (int) $request->query('per_page', self::PER_PAGE_DEFAULT);
        $perPage = max(1, min($perPage, self::PER_PAGE_MAKS));

        $hasil = $this->ringkasanService->ringkasanKebun($kebunId, $perPage);

        return $this->successResponse(
            [
                'default_kebun' => $hasil['default_kebun'],
                'node'          => $hasil['node']->items(),
            ],
            'Ringkasan jadwal lampu berhasil diambil.',
            200,
            $this->paginationMeta($hasil['node'])
        );
    }
}