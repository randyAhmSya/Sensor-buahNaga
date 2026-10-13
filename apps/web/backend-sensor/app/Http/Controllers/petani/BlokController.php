<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\blok\addBlokRequest;
use App\Http\Requests\blok\updateBlokRequest;
use App\Services\management_kebun\BlokService;
use App\Models\Kebun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class BlokController extends Controller
{
    use ApiResponser;

    private const PESAN_BLOK_TIDAK_DITEMUKAN = 'Data blok tidak ditemukan.';

    protected BlokService $blokService;

    public function __construct(BlokService $blokService)
    {
        $this->blokService = $blokService;
    }

    public function index(Request $request): JsonResponse
    {
        $kebunId = $request->query('kebun_id');

        if (!$kebunId) {
            return $this->errorResponse('Parameter kebun_id wajib disertakan di URL (?kebun_id=...).', 400);
        }

        $kebun = Kebun::find($kebunId);

        if (!$kebun) {
            return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        }
        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki akses ke kebun ini.', 403);
        }

        $bloks = $this->blokService->getAllBlokByKebun($kebunId);
        return $this->successResponse($bloks, 'Daftar blok berhasil diambil.');
    }

    public function store(addBlokRequest $request): JsonResponse
    {
        $kebun = Kebun::find($request->kebun_id);

        if (!$kebun) {
            return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        }
        if (Gate::denies('update', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki izin menambah blok di kebun ini.', 403);
        }

        $fileFoto = $request->file('foto');

        $blok = $this->blokService->createBlok($request->validated(), $fileFoto);
        return $this->successResponse($blok, 'Blok berhasil ditambahkan.', 201);
    }


    public function show(string $id): JsonResponse
    {
        $blok = $this->blokService->getBlokById($id);
        if (!$blok) {
            return $this->errorResponse(self::PESAN_BLOK_TIDAK_DITEMUKAN, 404);
        }

        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        return $this->successResponse($blok, 'Detail blok berhasil diambil.');
    }

    public function update(updateBlokRequest $request, string $id): JsonResponse
    {
        $blok = $this->blokService->getBlokById($id);
        if (!$blok) {
            return $this->errorResponse(self::PESAN_BLOK_TIDAK_DITEMUKAN, 404);
        }

        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('update', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki izin.', 403);
        }

        $fileFoto = $request->file('foto');

        $updatedBlok = $this->blokService->updateBlok($blok, $request->validated(), $fileFoto);
        return $this->successResponse($updatedBlok, 'Data blok berhasil diperbarui.');
    }

    public function destroy(string $id): JsonResponse
    {
        $blok = $this->blokService->getBlokById($id);
        if (!$blok) {
            return $this->errorResponse(self::PESAN_BLOK_TIDAK_DITEMUKAN, 404);
        }

        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('delete', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki izin.', 403);
        }

        $this->blokService->deleteBlok($blok);
        return $this->successResponse(null, 'Blok berhasil dihapus.');
    }
}