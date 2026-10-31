<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Models\Kebun;
use App\Services\management_kebun\DashboardService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    use ApiResponser;

    public function __construct(protected DashboardService $dashboardService) {}

    public function index(Request $request): JsonResponse
    {
        $kebunId = $request->query('kebun_id');
        if (!$kebunId) {
            return $this->errorResponse('Parameter kebun_id wajib disertakan (?kebun_id=...).', 400);
        }

        // Id yang bukan UUID bikin Postgres melempar error (500); anggap saja tidak ditemukan.
        $kebun = Str::isUuid($kebunId) ? Kebun::find($kebunId) : null;
        if (!$kebun) {
            return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        }
        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki akses ke kebun ini.', 403);
        }

        return $this->successResponse(
            $this->dashboardService->ringkasanKebun($kebun),
            'Data dashboard berhasil diambil.'
        );
    }
}