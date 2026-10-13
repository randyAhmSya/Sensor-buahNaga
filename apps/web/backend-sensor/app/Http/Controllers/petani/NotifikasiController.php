<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use App\Services\management_notifikasi\NotifikasiService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    use ApiResponser;

    private const PESAN_TENANT_TIDAK_TERHUBUNG = 'Akun ini tidak terhubung ke tenant.';

    public function __construct(protected NotifikasiService $notifikasiService) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        if (!$tenantId) {
            return $this->errorResponse(self::PESAN_TENANT_TIDAK_TERHUBUNG, 403);
        }

        $perPage = max(1, min((int) $request->query('per_page', 15), 100));
        $paginator = $this->notifikasiService->getUntukTenant($tenantId, $request->boolean('belum_dibaca'), $perPage);

        return $this->successResponse($paginator->items(), null, 200, $this->paginationMeta($paginator));
    }

    public function tandaiDibaca(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        if (!$tenantId) {
            return $this->errorResponse(self::PESAN_TENANT_TIDAK_TERHUBUNG, 403);
        }

        $notifikasi = Notifikasi::where('tenant_id', $tenantId)->find($id);
        if (!$notifikasi) {
            return $this->errorResponse('Notifikasi tidak ditemukan.', 404);
        }

        return $this->successResponse($this->notifikasiService->tandaiDibaca($notifikasi));
    }

    public function tandaiSemuaDibaca(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        if (!$tenantId) {
            return $this->errorResponse(self::PESAN_TENANT_TIDAK_TERHUBUNG, 403);
        }

        $jumlah = $this->notifikasiService->tandaiSemuaDibaca($tenantId);
        return $this->successResponse(['jumlah_ditandai' => $jumlah]);
    }
}