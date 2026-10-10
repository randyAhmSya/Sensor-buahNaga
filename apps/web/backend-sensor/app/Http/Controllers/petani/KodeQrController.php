<?php
 
namespace App\Http\Controllers\petani;
 
use App\Http\Controllers\Controller;
use App\Http\Requests\qr\addQrRequest;
use App\Http\Requests\qr\updateQrRequest;
use App\Http\Requests\qr\scanQrRequest;
use App\Services\management_kebun\KodeQrService;
use App\Services\management_kebun\QrScanService;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponser;
 
class KodeQrController extends Controller
{
    use ApiResponser;
 
    protected KodeQrService $qrService;
    protected QrScanService $scanService;
 
    public function __construct(KodeQrService $qrService, QrScanService $scanService)
    {
        $this->qrService = $qrService;
        $this->scanService = $scanService;
    }
 
    public function index(): JsonResponse
    {
        $qrs = $this->qrService->getAllQr();
        return $this->successResponse($qrs, 'Data Kode QR berhasil diambil.');
    }
 
    public function store(addQrRequest $request): JsonResponse
    {
        $qr = $this->qrService->createQr($request->validated());
 
        return $this->successResponse($qr, 'Kode QR berhasil dibuat.', 201);
    }
 
    public function show(string $id): JsonResponse
    {
        $qr = $this->qrService->getQrById($id);
        if (!$qr) return $this->errorResponse('Kode QR tidak ditemukan.', 404);
 
        return $this->successResponse($qr, 'Detail Kode QR berhasil diambil.');
    }
 
    public function update(updateQrRequest $request, string $id): JsonResponse
    {
        $qr = $this->qrService->getQrById($id);
        if (!$qr) return $this->errorResponse('Kode QR tidak ditemukan.', 404);

        $updatedQr = $this->qrService->updateQr($qr, $request->validated());
        return $this->successResponse($updatedQr, 'Kode QR berhasil diperbarui.');
    }
 
    public function destroy(string $id): JsonResponse
    {
        $qr = $this->qrService->getQrById($id);
        if (!$qr) return $this->errorResponse('Kode QR tidak ditemukan.', 404);

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
}
