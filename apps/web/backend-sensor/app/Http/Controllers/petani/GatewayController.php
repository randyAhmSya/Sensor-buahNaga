<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\gateway\addGatewayRequest;
use App\Http\Requests\gateway\updateGatewayRequest;
use App\Http\Requests\gateway\pairGatewayRequest;
use App\Services\management_kebun\GatewayService;
use App\Services\management_kebun\GatewayPairingService;
use App\Models\Blok;
use App\Models\Kebun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class GatewayController extends Controller
{
    use ApiResponser;

    private const PESAN_GATEWAY_TIDAK_DITEMUKAN = 'Data gateway tidak ditemukan.';
    private const PESAN_AKSES_DITOLAK = 'Akses ditolak.';

    protected GatewayService $gatewayService;
    protected GatewayPairingService $pairingService;

    public function __construct(GatewayService $gatewayService, GatewayPairingService $pairingService)
    {
        $this->gatewayService = $gatewayService;
        $this->pairingService = $pairingService;
    }

    public function index(Request $request): JsonResponse
    {
        $kebunId = $request->query('kebun_id');
        if (!$kebunId) {
            return $this->errorResponse('Parameter kebun_id wajib disertakan.', 400);
        }

        $kebun = Kebun::find($kebunId);
        if (!$kebun) {
            return $this->errorResponse('Data kebun tidak ditemukan.', 404);
        }
        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki akses ke kebun ini.', 403);
        }

        $gateways = $this->gatewayService->getAllGatewaysByKebun($kebunId);
        return $this->successResponse($gateways, 'Data gateway berhasil diambil.');
    }

    public function store(addGatewayRequest $request): JsonResponse
    {
        $blok = Blok::find($request->blok_id);
        if (!$blok) {
            return $this->errorResponse('Data blok tidak ditemukan.', 404);
        }

        $kebun = Kebun::find($blok->kebun_id);
        if (Gate::denies('update', $kebun)) {
            return $this->errorResponse('Anda tidak memiliki izin menambah gateway di area ini.', 403);
        }

        $gateway = $this->gatewayService->createGateway($request->validated());
        return $this->successResponse($gateway, 'Gateway berhasil didaftarkan.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $gateway = $this->gatewayService->getGatewayById($id);
        if (!$gateway) {
            return $this->errorResponse(self::PESAN_GATEWAY_TIDAK_DITEMUKAN, 404);
        }

        $blok = Blok::find($gateway->blok_id);
        $kebun = Kebun::find($blok->kebun_id);

        if (Gate::denies('view', $kebun)) {
            return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
        }

        return $this->successResponse($gateway, 'Detail gateway berhasil diambil.');
    }

    public function update(updateGatewayRequest $request, string $id): JsonResponse
    {
        $gateway = $this->gatewayService->getGatewayById($id);
        if (!$gateway) {
            return $this->errorResponse(self::PESAN_GATEWAY_TIDAK_DITEMUKAN, 404);
        }

        $blok = Blok::find($gateway->blok_id);
        $kebun = Kebun::find($blok->kebun_id);

        if (Gate::denies('update', $kebun)) {
            return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
        }

        $updatedGateway = $this->gatewayService->updateGateway($gateway, $request->validated());
        return $this->successResponse($updatedGateway, 'Data gateway berhasil diperbarui.');
    }

    public function destroy(string $id): JsonResponse
    {
        $gateway = $this->gatewayService->getGatewayById($id);
        if (!$gateway) {
            return $this->errorResponse(self::PESAN_GATEWAY_TIDAK_DITEMUKAN, 404);
        }

        $blok = Blok::find($gateway->blok_id);
        $kebun = Kebun::find($blok->kebun_id);

        if (Gate::denies('delete', $kebun)) {
            return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
        }

        $this->gatewayService->deleteGateway($gateway);
        return $this->successResponse(null, 'Gateway berhasil dihapus.');
    }

    /**
     * Dipanggil oleh ESP32 sendiri (bukan lewat app, tanpa auth user),
     * begitu dia berhasil konek WiFi dan punya kode_pairing dari captive portal.
     */
    public function pair(pairGatewayRequest $request): JsonResponse
    {
        $result = $this->pairingService->pair($request->kode_perangkat, $request->kode_pairing);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse([
            'gateway_id'    => $result['gateway_id'],
            'token_gateway' => $result['token_gateway'],
        ], 'Gateway berhasil dipasangkan.');
    }
}