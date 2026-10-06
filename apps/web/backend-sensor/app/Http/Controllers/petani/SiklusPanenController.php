<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\siklusPanen\addSiklusPanenRequest;
use App\Http\Requests\siklusPanen\updateSiklusPanenRequest;
use App\Services\management_kebun\SiklusPanenService;
use App\Models\Blok;
use App\Models\Kebun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class SiklusPanenController extends Controller
{
    use ApiResponser;

    protected SiklusPanenService $siklusService;

    public function __construct(SiklusPanenService $siklusService)
    {
        $this->siklusService = $siklusService;
    }

    public function index(Request $request): JsonResponse
    {
        $blokId = $request->query('blok_id');
        if (!$blokId) return $this->errorResponse('Parameter blok_id wajib disertakan.', 400);

        $blok = Blok::find($blokId);
        if (!$blok) return $this->errorResponse('Data blok tidak ditemukan.', 404);

        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('view', $kebun)) return $this->errorResponse('Anda tidak memiliki akses ke blok ini.', 403);

        $siklusList = $this->siklusService->getAllSiklusByBlok($blokId);
        return $this->successResponse($siklusList, 'Data siklus panen berhasil diambil.');
    }

    public function store(addSiklusPanenRequest $request): JsonResponse
    {
        $blok = Blok::find($request->block_id);
        if (!$blok) return $this->errorResponse('Data blok tidak ditemukan.', 404);

        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('update', $kebun)) return $this->errorResponse('Anda tidak memiliki izin di blok ini.', 403);

        $siklus = $this->siklusService->createSiklus($request->validated());
        return $this->successResponse($siklus, 'Siklus panen berhasil dimulai.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $siklus = $this->siklusService->getSiklusById($id);
        if (!$siklus) return $this->errorResponse('Data siklus panen tidak ditemukan.', 404);

        $blok = Blok::find($siklus->block_id);
        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('view', $kebun)) return $this->errorResponse('Akses ditolak.', 403);

        return $this->successResponse($siklus, 'Detail siklus panen berhasil diambil.');
    }

    public function update(updateSiklusPanenRequest $request, string $id): JsonResponse
    {
        $siklus = $this->siklusService->getSiklusById($id);
        if (!$siklus) return $this->errorResponse('Data siklus panen tidak ditemukan.', 404);

        $blok = Blok::find($siklus->block_id);
        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('update', $kebun)) return $this->errorResponse('Akses ditolak.', 403);

        $updatedSiklus = $this->siklusService->updateSiklus($siklus, $request->validated());
        return $this->successResponse($updatedSiklus, 'Data siklus panen berhasil diperbarui.');
    }

    public function destroy(string $id): JsonResponse
    {
        $siklus = $this->siklusService->getSiklusById($id);
        if (!$siklus) return $this->errorResponse('Data siklus panen tidak ditemukan.', 404);

        $blok = Blok::find($siklus->block_id);
        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('delete', $kebun)) return $this->errorResponse('Akses ditolak.', 403);

        $this->siklusService->deleteSiklus($siklus);
        return $this->successResponse(null, 'Siklus panen berhasil dihapus.');
    }
}