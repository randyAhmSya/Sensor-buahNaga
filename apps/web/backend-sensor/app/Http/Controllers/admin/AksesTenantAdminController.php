<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\management_admin\AksesTenantService;
use App\Traits\ApiResponser;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AksesTenantAdminController extends Controller
{
    use ApiResponser;

    public function __construct(protected AksesTenantService $aksesTenantService) {}

    public function ajukan(Request $request, string $tenantId): JsonResponse
    {
        $tenant = Tenant::find($tenantId);
        if (!$tenant) {
            return $this->errorResponse('Tenant tidak ditemukan.', 404);
        }

        $request->validate([
            'alasan' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $akses = $this->aksesTenantService->ajukan($tenantId, $request->user()->id, $request->input('alasan'));
            return $this->successResponse($akses, 'Permintaan akses berhasil diajukan, menunggu persetujuan tenant.', 201);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 409);
        }
    }

    public function riwayatSaya(Request $request): JsonResponse
    {
        $riwayat = $this->aksesTenantService->riwayatAdmin($request->user()->id);
        return $this->successResponse($riwayat, 'Riwayat permintaan akses Anda berhasil diambil.');
    }
}