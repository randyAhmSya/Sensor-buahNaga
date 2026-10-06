<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Models\Blok;
use App\Models\Kebun;
use App\Services\management_kebun\BlokStatusService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class BlokStatusController extends Controller
{
    use ApiResponser;

    public function __construct(protected BlokStatusService $blokStatusService) {}

    public function statusLampu(string $blokId): JsonResponse
    {
        $blok = Blok::find($blokId);
        if (!$blok) return $this->errorResponse('Data blok tidak ditemukan.', 404);

        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('view', $kebun)) return $this->errorResponse('Akses ditolak.', 403);

        return $this->successResponse(
            $this->blokStatusService->getRingkasanBlok($blokId),
            'Status lampu per blok berhasil diambil.'
        );
    }
}