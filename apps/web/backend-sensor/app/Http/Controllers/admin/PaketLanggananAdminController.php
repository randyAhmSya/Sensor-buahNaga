<?php

namespace App\Http\Controllers\admin;

use App\Http\Requests\paketLangganan\StorePaketLanggananRequest;
use App\Http\Requests\paketLangganan\UpdatePaketLanggananRequest;
use App\Http\Controllers\Controller;
use App\Services\management_admin\PaketLanggananAdminService;
use App\Traits\ApiResponser;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaketLanggananAdminController extends Controller
{
    use ApiResponser;

    public function __construct(protected PaketLanggananAdminService $paketService) {}

    public function index(): JsonResponse
    {
        return $this->successResponse($this->paketService->getSemuaPaket());
    }

    public function show(string $id): JsonResponse
    {
        $paket = $this->paketService->getPaketById($id);
        if (!$paket) return $this->errorResponse('Paket tidak ditemukan.', 404);

        return $this->successResponse($paket);
    }

    public function store(StorePaketLanggananRequest $request): JsonResponse
    {
        $paket = $this->paketService->buatPaket($request->validated(), $request->user()->id);
        return $this->successResponse($paket, 'Paket langganan berhasil dibuat.', 201);
    }

    public function update(UpdatePaketLanggananRequest $request, string $id): JsonResponse
    {
        $paket = $this->paketService->getPaketById($id);
        if (!$paket) return $this->errorResponse('Paket tidak ditemukan.', 404);

        $updated = $this->paketService->updatePaket($paket, $request->validated(), $request->user()->id);
        return $this->successResponse($updated, 'Paket langganan berhasil diperbarui.');
    }

    public function nonaktifkan(Request $request, string $id): JsonResponse
    {
        $paket = $this->paketService->getPaketById($id);
        if (!$paket) return $this->errorResponse('Paket tidak ditemukan.', 404);

        $this->paketService->nonaktifkanPaket($paket, $request->user()->id);
        return $this->successResponse($paket->fresh(), 'Paket dinonaktifkan - nggak muncul lagi di daftar beli petani.');
    }

    public function aktifkan(Request $request, string $id): JsonResponse
    {
        $paket = $this->paketService->getPaketById($id);
        if (!$paket) return $this->errorResponse('Paket tidak ditemukan.', 404);

        $this->paketService->aktifkanPaket($paket, $request->user()->id);
        return $this->successResponse($paket->fresh(), 'Paket diaktifkan lagi.');
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $paket = $this->paketService->getPaketById($id);
        if (!$paket) return $this->errorResponse('Paket tidak ditemukan.', 404);

        try {
            $this->paketService->hapusPaket($paket, $request->user()->id);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 409);
        }

        return $this->successResponse(null, 'Paket langganan berhasil dihapus.');
    }
}