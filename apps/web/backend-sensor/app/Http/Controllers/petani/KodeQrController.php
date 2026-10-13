<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\qr\addQrRequest;
use App\Http\Requests\qr\updateQrRequest;
use App\Http\Requests\qr\scanQrRequest;
use App\Services\management_kebun\KodeQrService;
use App\Services\management_kebun\QrScanService;
use App\Models\KodeQr;
use App\Models\NodeSensor;
use App\Models\Kebun;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use App\Traits\ApiResponser;

class KodeQrController extends Controller
{
    use ApiResponser;

    private const PESAN_QR_TIDAK_DITEMUKAN = 'Kode QR tidak ditemukan.';
    private const PESAN_AKSES_DITOLAK = 'Akses ditolak.';
    private const PESAN_KHUSUS_SUPERADMIN = 'Aksi ini khusus untuk Super Admin.';

    protected KodeQrService $qrService;
    protected QrScanService $scanService;

    public function __construct(KodeQrService $qrService, QrScanService $scanService)
    {
        $this->qrService = $qrService;
        $this->scanService = $scanService;
    }

    /**
     * Daftar penuh stok Kode QR — khusus Super Admin (ini inventory
     * provisioning, bukan data operasional milik tenant tertentu).
     */
    public function index(): JsonResponse
    {
        if (auth()->user()->role !== 'superAdmin') {
            return $this->errorResponse(self::PESAN_KHUSUS_SUPERADMIN, 403);
        }

        $qrs = $this->qrService->getAllQr();
        return $this->successResponse($qrs, 'Data Kode QR berhasil diambil.');
    }

    /**
     * Provisioning stiker QR baru — khusus Super Admin.
     */
    public function store(addQrRequest $request): JsonResponse
    {
        if ($request->user()->role !== 'superAdmin') {
            return $this->errorResponse(self::PESAN_KHUSUS_SUPERADMIN, 403);
        }

        $qr = $this->qrService->createQr($request->validated());

        return $this->successResponse($qr, 'Kode QR berhasil dibuat.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $qr = $this->qrService->getQrById($id);
        if (!$qr) {
            return $this->errorResponse(self::PESAN_QR_TIDAK_DITEMUKAN, 404);
        }

        if (!$this->bolehAksesQr($this->resolveKebunFromQr($qr))) {
            return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
        }

        return $this->successResponse($qr, 'Detail Kode QR berhasil diambil.');
    }

    public function update(updateQrRequest $request, string $id): JsonResponse
    {
        $qr = $this->qrService->getQrById($id);
        if (!$qr) {
            return $this->errorResponse(self::PESAN_QR_TIDAK_DITEMUKAN, 404);
        }

        if (!$this->bolehAksesQr($this->resolveKebunFromQr($qr), 'update')) {
            return $this->errorResponse(self::PESAN_AKSES_DITOLAK, 403);
        }

        $updatedQr = $this->qrService->updateQr($qr, $request->validated());
        return $this->successResponse($updatedQr, 'Kode QR berhasil diperbarui.');
    }

    /**
     * Hapus Kode QR — khusus Super Admin (sama alasannya dengan store():
     * ini manajemen stok fisik, bukan aksi operasional petani).
     */
    public function destroy(string $id): JsonResponse
    {
        if (auth()->user()->role !== 'superAdmin') {
            return $this->errorResponse(self::PESAN_KHUSUS_SUPERADMIN, 403);
        }

        $qr = $this->qrService->getQrById($id);
        if (!$qr) {
            return $this->errorResponse(self::PESAN_QR_TIDAK_DITEMUKAN, 404);
        }

        $this->qrService->deleteQr($qr);
        return $this->successResponse(null, 'Kode QR berhasil dihapus.');
    }

    public function scan(scanQrRequest $request): JsonResponse
    {
        $meta = [
            'platform'   => $request->platform,
            'ip_address' => $request->ip(),
            'latitude'   => $request->latitude,
            'longitude'  => $request->longitude,
        ];

        $result = $this->scanService->scan($request->teks_kode_qr, $meta);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 403);
        }

        return $this->successResponse($result['data'], 'Scan berhasil, data blok/sensor ditemukan.');
    }

    public function logs(): JsonResponse
    {
        $user = auth()->user();
        $logs = \App\Models\QrScanLog::with(['kodeQr.nodeSensor'])
            ->where('user_id', $user->id)
            ->latest('dicatat_pada')
            ->limit(50)
            ->get();

        return $this->successResponse($logs, 'Data riwayat scan QR berhasil diambil.');
    }

    /**
     * QR yang belum nempel ke node mana pun = stok, belum ada tenant
     * pemiliknya, jadi cuma superAdmin yang boleh akses. QR yang sudah
     * nempel ikut aturan akses kebun pemilik node-nya (sama seperti
     * JadwalLampuController::resolveKebunFromJadwal).
     */
    private function resolveKebunFromQr(KodeQr $qr): ?Kebun
    {
        $sensor = NodeSensor::with('blok')->where('qr_id', $qr->getKey())->first();
        return $sensor && $sensor->blok ? Kebun::find($sensor->blok->kebun_id) : null;
    }

    private function bolehAksesQr(?Kebun $kebun, string $ability = 'view'): bool
    {
        if (!$kebun) {
            return auth()->user()->role === 'superAdmin';
        }

        return Gate::allows($ability, $kebun);
    }
}