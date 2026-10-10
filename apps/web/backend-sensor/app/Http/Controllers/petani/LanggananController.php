<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Http\Requests\langganan\AjukanPembelianLanggananRequest;
use App\Services\management_langganan\LanggananService;
use App\Models\TransaksiLangganan;
use Illuminate\Support\Facades\Storage;
use App\Traits\ApiResponser;
use Illuminate\Http\Request;

class LanggananController extends Controller
{
    use ApiResponser;

    public function __construct(protected LanggananService $langgananService) {}

    public function paket(Request $request)
    {
        // katalog paket, nggak butuh tenant_id, jadi nggak perlu dicek
        return $this->successResponse($this->langgananService->getPaketAktif());
    }

    public function status(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        if (!$tenantId) {
            return $this->ErrorResponse('Akun ini tidak terhubung ke tenant.', 403);
        }

        $langganan = $this->langgananService->getStatus($tenantId);

        return $this->successResponse([
            'status_langganan' => $langganan->statusEfektif(),
            'sisa_hari' => $langganan->sisaHariAktual(),
            'dalam_masa_tenggang' => $langganan->dalamMasaTenggang(),
        ]);
    }

    public function riwayat(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        if (!$tenantId) {
            return $this->ErrorResponse('Akun ini tidak terhubung ke tenant.', 403);
        }

        $perPage = max(1, min((int) $request->query('per_page', 15), 100));
        $paginator = $this->langgananService->getRiwayat($tenantId, $perPage);

        return $this->successResponse($paginator->items(), null, 200, $this->paginationMeta($paginator));
    }

    public function ajukanPembelian(AjukanPembelianLanggananRequest $request)
    {
        $tenantId = $request->user()->tenant_id;
        if (!$tenantId) {
            return $this->ErrorResponse('Akun ini tidak terhubung ke tenant.', 403);
        }

        $transaksi = $this->langgananService->ajukanPembelian(
            $tenantId,
            $request->validated('paket_langganan_id'),
            $request->file('bukti_transfer'),
        );

        return $this->successResponse($transaksi, 'Pengajuan pembelian berhasil dikirim, menunggu verifikasi admin.', 201);
    }
    public function buktiTransfer(Request $request, string $id)
    {
        $tenantId = $request->user()->tenant_id;
        if (!$tenantId) {
            return $this->ErrorResponse('Akun ini tidak terhubung ke tenant.', 403);
        }

        $transaksi = TransaksiLangganan::where('tenant_id', $tenantId)->find($id);
        if (!$transaksi || !$transaksi->bukti_transfer) {
            return $this->ErrorResponse('Bukti transfer tidak ditemukan.', 404);
        }

        return Storage::disk('local')->response($transaksi->bukti_transfer);
    }
    public function beliOnline(Request $request)
    {
        $request->validate([
            'paket_langganan_id' => 'required|uuid|exists:paket_langganans,id_paket',
        ]);

        $hasil = $this->langgananService->ajukanPembelianOnline(
            $request->user()->tenant_id,
            $request->paket_langganan_id,
        );

        return $this->successResponse($hasil, 'Snap token berhasil dibuat');
    }
}