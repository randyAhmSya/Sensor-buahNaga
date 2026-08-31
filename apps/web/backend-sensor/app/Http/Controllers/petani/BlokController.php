<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\blok\addBlokRequest;
use App\Http\Requests\blok\updateBlokRequest;
use App\Services\management_kebun\BlokService;
use App\Models\kebun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class BlokController extends Controller
{
    use ApiResponser;

    protected BlokService $blokService;

    public function __construct(BlokService $blokService)
    {
        $this->blokService = $blokService;
    }

    // ==========================================================
    // 1. GET ALL BLOK (Berdasarkan ID Kebun)
    // ==========================================================
    public function index(Request $request): JsonResponse
    {
        $kebunId = $request->query('kebun_id');

        if (!$kebunId) {
            return $this->ErrorResponse('Parameter kebun_id wajib disertakan di URL (?kebun_id=...).', 400);
        }

        $kebun = kebun::find($kebunId);

        if (!$kebun) return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        if (Gate::denies('view', $kebun)) return $this->errorResponse('Anda tidak memiliki akses ke kebun ini.', 403);

        $bloks = $this->blokService->getAllBlokByKebun($kebunId);
        return $this->successResponse($bloks, 'Daftar blok berhasil diambil.');
    }

    // ==========================================================
    // 2. CREATE BLOK
    // ==========================================================
    public function store(addBlokRequest $request): JsonResponse
    {
        $kebun = kebun::find($request->kebun_id);

        if (!$kebun) return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        if (Gate::denies('update', $kebun)) return $this->errorResponse('Anda tidak memiliki izin menambah blok di kebun ini.', 403);

        $blok = $this->blokService->createBlok($request->validated());
        return $this->successResponse($blok, 'Blok berhasil ditambahkan.', 201);
    }

    // ==========================================================
    // 3. READ ONE (SHOW)
    // ==========================================================
    public function show(string $id): JsonResponse
    {
        $blok = $this->blokService->getBlokById($id);
        if (!$blok) return $this->errorResponse('Data blok tidak ditemukan.', 404);

        $kebun = kebun::find($blok->kebun_id);
        if (Gate::denies('view', $kebun)) return $this->errorResponse('Anda tidak memiliki akses.', 403);

        return $this->successResponse($blok, 'Detail blok berhasil diambil.');
    }

    // ==========================================================
    // 4. UPDATE
    // ==========================================================
    public function update(updateBlokRequest $request, string $id): JsonResponse
    {
        $blok = $this->blokService->getBlokById($id);
        if (!$blok) return $this->errorResponse('Data blok tidak ditemukan.', 404);

        $kebun = kebun::find($blok->kebun_id);
        if (Gate::denies('update', $kebun)) return $this->errorResponse('Anda tidak memiliki izin.', 403);

        $updatedBlok = $this->blokService->updateBlok($blok, $request->validated());
        return $this->successResponse($updatedBlok, 'Data blok berhasil diperbarui.');
    }

    // ==========================================================
    // 5. DELETE
    // ==========================================================
    public function destroy(string $id): JsonResponse
    {
        $blok = $this->blokService->getBlokById($id);
        if (!$blok) return $this->errorResponse('Data blok tidak ditemukan.', 404);

        $kebun = kebun::find($blok->kebun_id);
        if (Gate::denies('delete', $kebun)) return $this->errorResponse('Anda tidak memiliki izin.', 403);

        $this->blokService->deleteBlok($blok);
        return $this->successResponse(null, 'Blok berhasil dihapus.');
    }
}
