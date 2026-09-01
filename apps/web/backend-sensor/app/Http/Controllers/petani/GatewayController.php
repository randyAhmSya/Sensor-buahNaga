<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\gateway\addGatewayRequest;
use App\Http\Requests\gateway\updateGatewayRequest;
use App\Services\management_kebun\GatewayService;
use App\Models\blok;
use App\Models\kebun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class GatewayController extends Controller
{
    use ApiResponser;

    protected GatewayService $gatewayService;

    public function __construct(GatewayService $gatewayService)
    {
        $this->gatewayService = $gatewayService;
    }

    public function index(Request $request): JsonResponse
    {
        $kebunId = $request->query('kebun_id');
        if (!$kebunId) return $this->errorResponse('Parameter kebun_id wajib disertakan.', 400);

        $kebun = kebun::find($kebunId);
        if (!$kebun) return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        if (Gate::denies('view', $kebun)) return $this->errorResponse('Anda tidak memiliki akses ke kebun ini.', 403);

        $gateways = $this->gatewayService->getAllGatewaysByKebun($kebunId);
        return $this->successResponse($gateways, 'Data gateway berhasil diambil.');
    }

    public function store(addGatewayRequest $request): JsonResponse
    {
        $blok = blok::find($request->blok_id);
        if (!$blok) return $this->errorResponse('Data blok tidak ditemukan.', 404);

        $kebun = kebun::find($blok->kebun_id);
        if (Gate::denies('update', $kebun)) return $this->errorResponse('Anda tidak memiliki izin menambah gateway di area ini.', 403);

        $gateway = $this->gatewayService->createGateway($request->validated());
        return $this->successResponse($gateway, 'Gateway berhasil didaftarkan.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $gateway = $this->gatewayService->getGatewayById($id);
        if (!$gateway) return $this->errorResponse('Data gateway tidak ditemukan.', 404);

        $blok = blok::find($gateway->blok_id);
        $kebun = kebun::find($blok->kebun_id);

        if (Gate::denies('view', $kebun)) return $this->errorResponse('Akses ditolak.', 403);

        return $this->successResponse($gateway, 'Detail gateway berhasil diambil.');
    }

    public function update(updateGatewayRequest $request, string $id): JsonResponse
    {
        $gateway = $this->gatewayService->getGatewayById($id);
        if (!$gateway) return $this->errorResponse('Data gateway tidak ditemukan.', 404);

        $blok = blok::find($gateway->blok_id);
        $kebun = kebun::find($blok->kebun_id);

        if (Gate::denies('update', $kebun)) return $this->errorResponse('Akses ditolak.', 403);

        $updatedGateway = $this->gatewayService->updateGateway($gateway, $request->validated());
        return $this->successResponse($updatedGateway, 'Data gateway berhasil diperbarui.');
    }

    public function destroy(string $id): JsonResponse
    {
        $gateway = $this->gatewayService->getGatewayById($id);
        if (!$gateway) return $this->errorResponse('Data gateway tidak ditemukan.', 404);

        $blok = blok::find($gateway->blok_id);
        $kebun = kebun::find($blok->kebun_id);

        if (Gate::denies('delete', $kebun)) return $this->errorResponse('Akses ditolak.', 403);

        $this->gatewayService->deleteGateway($gateway);
        return $this->successResponse(null, 'Gateway berhasil dihapus.');
    }
}
