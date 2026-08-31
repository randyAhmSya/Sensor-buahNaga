<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\node\addNodeRequest;
use App\Http\Requests\node\updateNodeRequest;
use App\Services\management_kebun\NodeService;
use App\Models\nodeSensor;
use App\Models\blok;
use App\Models\kebun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class NodeController extends Controller
{
    use ApiResponser;

    protected NodeService $nodeService;

    public function __construct(NodeService $nodeService)
    {
        $this->nodeService = $nodeService;
    }

    // ==========================================================
    // 1. GET ALL SENSOR (Berdasarkan ID Kebun)
    // ==========================================================
    public function index(Request $request): JsonResponse
    {
        $kebunId = $request->query('kebun_id');

        if (!$kebunId) return $this->errorResponse('Parameter kebun_id wajib disertakan (?kebun_id=...).', 400);

        $kebun = kebun::find($kebunId);
        if (!$kebun) return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        if (Gate::denies('view', $kebun)) return $this->errorResponse('Anda tidak memiliki akses ke kebun ini.', 403);

        $nodes = $this->nodeService->getAllNodesByKebun($kebunId);
        return $this->successResponse($nodes, 'Daftar sensor berhasil diambil.');
    }

    // ==========================================================
    // 2. CREATE SENSOR BARU
    // ==========================================================
    public function store(addNodeRequest $request): JsonResponse
    {
        $blok = blok::find($request->blok_id);
        if (!$blok) return $this->errorResponse('Data blok tidak ditemukan.', 404);

        $kebun = kebun::find($blok->kebun_id);
        // Cek izin update kebun induknya
        if (Gate::denies('update', $kebun)) return $this->errorResponse('Anda tidak memiliki izin menambah sensor di area ini.', 403);

        $node = $this->nodeService->createNode($request->validated());
        return $this->successResponse($node, 'Sensor berhasil didaftarkan dan dipasang pada blok.', 201);
    }

    // ==========================================================
    // 3. LIHAT DETAIL 1 SENSOR
    // ==========================================================
    public function show(string $id): JsonResponse
    {
        $node = $this->nodeService->getNodeById($id);
        if (!$node) return $this->errorResponse('Data sensor tidak ditemukan.', 404);

        // Lacak ke atas: Sensor -> Blok -> Kebun
        $blok = blok::find($node->blok_id);
        $kebun = kebun::find($blok->kebun_id);

        if (Gate::denies('view', $kebun)) return $this->errorResponse('Anda tidak memiliki akses.', 403);

        return $this->successResponse($node, 'Detail sensor berhasil diambil.');
    }

    // ==========================================================
    // 4. UPDATE SENSOR
    // ==========================================================
    public function update(updateNodeRequest $request, string $id): JsonResponse
    {
        $node = $this->nodeService->getNodeById($id);
        if (!$node) return $this->errorResponse('Data sensor tidak ditemukan.', 404);

        $blok = blok::find($node->blok_id);
        $kebun = kebun::find($blok->kebun_id);

        if (Gate::denies('update', $kebun)) return $this->errorResponse('Anda tidak memiliki izin.', 403);

        $updatedNode = $this->nodeService->updateNode($node, $request->validated());
        return $this->successResponse($updatedNode, 'Data sensor berhasil diperbarui.');
    }

    // ==========================================================
    // 5. DELETE SENSOR
    // ==========================================================
    public function destroy(string $id): JsonResponse
    {
        $node = $this->nodeService->getNodeById($id);
        if (!$node) return $this->errorResponse('Data sensor tidak ditemukan.', 404);

        $blok = blok::find($node->blok_id);
        $kebun = kebun::find($blok->kebun_id);

        if (Gate::denies('delete', $kebun)) return $this->errorResponse('Anda tidak memiliki izin.', 403);

        $this->nodeService->deleteNode($node);
        return $this->successResponse(null, 'Sensor berhasil dihapus dari sistem.');
    }
}
