<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Models\NodeSensor;
use App\Services\management_kebun\NodeRingkasanService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class NodeRingkasanController extends Controller
{
    use ApiResponser;

    public function __construct(protected NodeRingkasanService $ringkasanService) {}

    public function show(string $id): JsonResponse
    {
        // Id yang bukan UUID bikin Postgres melempar error (500); anggap tidak ditemukan.
        $node = Str::isUuid($id)
            ? NodeSensor::with(['blok.kebun', 'gateway', 'qr'])->find($id)
            : null;

        if (!$node || !$node->blok || !$node->blok->kebun) {
            return $this->errorResponse('Data node sensor tidak ditemukan.', 404);
        }

        if (Gate::denies('view', $node->blok->kebun)) {
            return $this->errorResponse('Akses ditolak.', 403);
        }

        return $this->successResponse(
            $this->ringkasanService->ringkasan($node),
            'Ringkasan node berhasil diambil.'
        );
    }
}