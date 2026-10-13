<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Services\management_admin\AksesTenantService;
use App\Traits\ApiResponser;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AksesTenantController extends Controller
{
    use ApiResponser;

    public function __construct(protected AksesTenantService $aksesTenantService) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        if (!$tenantId) {
            return $this->errorResponse('Akun ini tidak terhubung ke tenant.', 403);
        }

        $riwayat = $this->aksesTenantService->riwayatTenant($tenantId);
        return $this->successResponse($riwayat, 'Riwayat permintaan akses Super Admin berhasil diambil.');
    }

    public function setujui(Request $request, string $id): JsonResponse
    {
        try {
            $akses = $this->aksesTenantService->setujui($id, $request->user());
            return $this->successResponse($akses, 'Akses Super Admin disetujui.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Permintaan akses tidak ditemukan.', 404);
        } catch (AuthorizationException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 409);
        }
    }

    public function tolak(Request $request, string $id): JsonResponse
    {
        try {
            $akses = $this->aksesTenantService->tolak($id, $request->user(), $request->input('alasan'));
            return $this->successResponse($akses, 'Permintaan akses ditolak.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Permintaan akses tidak ditemukan.', 404);
        } catch (AuthorizationException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 409);
        }
    }

    public function cabut(Request $request, string $id): JsonResponse
    {
        try {
            $akses = $this->aksesTenantService->cabut($id, $request->user());
            return $this->successResponse($akses, 'Akses Super Admin dicabut.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Permintaan akses tidak ditemukan.', 404);
        } catch (AuthorizationException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 409);
        }
    }
}
