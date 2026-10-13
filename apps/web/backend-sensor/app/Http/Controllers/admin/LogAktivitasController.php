<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Services\management_admin\LogAktivitasService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogAktivitasController extends Controller
{
    use ApiResponser;

    public function __construct(protected LogAktivitasService $logAktivitasService) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', 15), 100));
        $paginator = $this->logAktivitasService->getSemua($perPage);

        return $this->successResponse($paginator->items(), null, 200, $this->paginationMeta($paginator));
    }
}
