<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\TransaksiLangganan;
use App\Services\management_langganan\LanggananService;
use App\Traits\ApiResponser;
use DomainException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\langganan\TolakTransaksiRequest;

class LanggananAdminController extends Controller
{
    use ApiResponser;

    public function __construct(protected LanggananService $langgananService) {}

    public function index(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:menunggu_verifikasi,berhasil,ditolak',
        ]);

        $perPage = max(1, min((int) $request->query('per_page', 15), 100));
        $paginator = $this->langgananService->getTransaksiUntukAdmin($request->query('status', 'menunggu_verifikasi'), $perPage);

        return $this->successResponse($paginator->items(), null, 200, $this->paginationMeta($paginator));
    }

    public function verifikasi(Request $request, string $id)
    {
        try {
            $transaksi = $this->langgananService->verifikasiPembelian($id, $request->user()->id);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Transaksi tidak ditemukan.', 404);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 409);
        }

        return $this->successResponse($transaksi, 'Transaksi diverifikasi, langganan tenant diperpanjang.');
    }

    public function tolak(TolakTransaksiRequest $request, string $id)
    {
        try {
            $transaksi = $this->langgananService->tolakPembelian($id, $request->user()->id, $request->validated('alasan'));
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Transaksi tidak ditemukan.', 404);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 409);
        }

        return $this->successResponse($transaksi, 'Transaksi ditolak.');
    }
    public function buktiTransfer(string $id)
    {
        $transaksi = TransaksiLangganan::find($id);
        if (!$transaksi || !$transaksi->bukti_transfer) {
            return $this->errorResponse('Bukti transfer tidak ditemukan.', 404);
        }

        $isi = Storage::disk('local')->get($transaksi->bukti_transfer);
        $mime = Storage::disk('local')->mimeType($transaksi->bukti_transfer);

        return response($isi)->header('Content-Type', $mime);
    }
}