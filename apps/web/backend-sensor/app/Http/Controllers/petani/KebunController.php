<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\kebun\addkebunRequest;
use App\Http\Requests\Kebun\updatekebunRequest;
use App\Services\management_admin\AksesTenantService;
use App\Services\management_kebun\KebunService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class KebunController extends Controller
{
    use ApiResponser;

    private const PESAN_KEBUN_TIDAK_DITEMUKAN = 'Data kebun tidak ditemukan.';
    private const PESAN_TENANT_TIDAK_DITEMUKAN = 'Tenant tidak ditemukan.';

    protected KebunService $kebunService;
    protected AksesTenantService $aksesTenantService;

    public function __construct(KebunService $kebunService, AksesTenantService $aksesTenantService)
    {
        $this->kebunService = $kebunService;
        $this->aksesTenantService = $aksesTenantService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'superAdmin') {
            $tenantId = $request->query('tenant_id');
            if (!$tenantId) {
                return $this->errorResponse('Super Admin wajib menyertakan tenant_id (?tenant_id=...).', 400);
            }

            $tenant = \App\Models\Tenant::find($tenantId);
            if (!$tenant) {
                return $this->errorResponse(self::PESAN_TENANT_TIDAK_DITEMUKAN, 404);
            }

            if (!$this->aksesTenantService->bolehAkses($tenantId, $user->id)) {
                return $this->errorResponse('Anda belum mendapat izin akses ke tenant ini.', 403);
            }
        } else {
            $tenantId = $user->tenant_id;
        }

        $kebuns = $this->kebunService->getAllKebun($tenantId);
        return $this->successResponse($kebuns, 'Daftar kebun berhasil diambil.');
    }

    public function store(addkebunRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'superAdmin') {
            if (!$request->filled('tenant_id')) {
                return $this->errorResponse('Super Admin wajib menyertakan tenant_id dari pemilik kebun di Body JSON.', 400);
            }
            $tenantId = $request->input('tenant_id');

            $tenant = \App\Models\Tenant::find($tenantId);
            if (!$tenant) {
                return $this->errorResponse(self::PESAN_TENANT_TIDAK_DITEMUKAN, 404);
            }

            // Disamakan dengan index()/KebunPolicy: satu mekanisme consent
            // (AksesTenantService::bolehAkses) untuk semua aksi superAdmin
            // lintas tenant, bukan cek tenant->is_admin_allowed terpisah.
            if (!$this->aksesTenantService->bolehAkses($tenantId, $user->id)) {
                return $this->errorResponse('Anda belum mendapat izin akses ke tenant ini.', 403);
            }
        } else {
            $tenantId = $user->tenant_id;
        }

        $fileFoto = $request->file('foto');
        $kebun = $this->kebunService->createKebun($tenantId, $request->validated(), $fileFoto);

        return $this->successResponse($kebun, 'Kebun berhasil ditambahkan.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $kebun = $this->kebunService->getKebunById($id);

        if (!$kebun) {
            return $this->errorResponse(self::PESAN_KEBUN_TIDAK_DITEMUKAN, 404);
        }

        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki akses ke kebun ini (Izin admin belum dinyalakan).', 403);
        }

        return $this->successResponse($kebun, 'Detail kebun berhasil diambil.');
    }

    public function update(updatekebunRequest $request, string $id): JsonResponse
    {
        $kebun = $this->kebunService->getKebunById($id);

        if (!$kebun) {
            return $this->errorResponse(self::PESAN_KEBUN_TIDAK_DITEMUKAN, 404);
        }

        if (Gate::denies('update', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki izin memperbarui kebun ini.', 403);
        }
        $fileFoto = $request->file('foto');

        $updatedKebun = $this->kebunService->updateKebun($kebun, $request->validated(), $fileFoto);

        return $this->successResponse($updatedKebun, 'Data kebun berhasil diperbarui.');
    }

    public function destroy(string $id): JsonResponse
    {
        $kebun = $this->kebunService->getKebunById($id);

        if (!$kebun) {
            return $this->errorResponse(self::PESAN_KEBUN_TIDAK_DITEMUKAN, 404);
        }

        if (Gate::denies('delete', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki izin menghapus kebun ini.', 403);
        }

        $this->kebunService->deleteKebun($kebun);

        return $this->successResponse(null, 'Kebun berhasil dihapus.');
    }
}