<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\management_admin\TenantAdminService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantAdminController extends Controller
{
    use ApiResponser;

    private const PESAN_TENANT_TIDAK_DITEMUKAN = 'Tenant tidak ditemukan.';

    public function __construct(protected TenantAdminService $tenantAdminService) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', 15), 100));
        $paginator = $this->tenantAdminService->getSemuaTenant($perPage);

        return $this->successResponse($paginator->items(), null, 200, $this->paginationMeta($paginator));
    }

    public function show(string $id): JsonResponse
    {
        $detail = $this->tenantAdminService->getDetailTenant($id);
        if (!$detail) {
            return $this->errorResponse(self::PESAN_TENANT_TIDAK_DITEMUKAN, 404);
        }

        return $this->successResponse($detail);
    }

    public function nonaktifkan(Request $request, string $id): JsonResponse
    {
        $tenant = Tenant::find($id);
        if (!$tenant) {
            return $this->errorResponse(self::PESAN_TENANT_TIDAK_DITEMUKAN, 404);
        }

        $this->tenantAdminService->nonaktifkanTenant($tenant, $request->user()->id);
        return $this->successResponse($tenant->fresh(), 'Tenant dinonaktifkan.');
    }

    public function aktifkan(Request $request, string $id): JsonResponse
    {
        $tenant = Tenant::find($id);
        if (!$tenant) {
            return $this->errorResponse(self::PESAN_TENANT_TIDAK_DITEMUKAN, 404);
        }

        $this->tenantAdminService->aktifkanTenant($tenant, $request->user()->id);
        return $this->successResponse($tenant->fresh(), 'Tenant diaktifkan kembali.');
    }
}