<?php

namespace App\Http\Controllers;

use App\Services\management_langganan\LanggananService;
use App\Services\management_pembayaran\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookMidtransController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService,
        protected LanggananService $langgananService,
    ) {}

    public function handle(Request $request)
    {
        $orderId           = $request->input('order_id');
        $statusCode        = $request->input('status_code');
        $grossAmount       = $request->input('gross_amount');
        $signature         = $request->input('signature_key');
        $transactionStatus = $request->input('transaction_status');
        $fraudStatus       = $request->input('fraud_status');
        $midtransTrxId     = $request->input('transaction_id');

        if (!$this->midtransService->verifikasiSignature($orderId, $statusCode, $grossAmount, $signature)) {
            Log::warning('Midtrans webhook: signature tidak valid', ['order_id' => $orderId]);
            return response()->json(['message' => 'invalid signature'], 403);
        }

        $diproses = null;

        if (in_array($transactionStatus, ['capture', 'settlement']) && $fraudStatus !== 'deny') {
            $diproses = $this->langgananService->verifikasiOtomatisViaGateway($orderId, $midtransTrxId);
        } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
            $diproses = $this->langgananService->tolakOtomatisViaGateway($orderId, "Pembayaran {$transactionStatus} oleh Midtrans");
        }
        // 'pending' dibiarkan apa adanya, Midtrans bakal kirim notifikasi lanjutan

        if ($diproses === false) {
            Log::warning('Midtrans webhook: order_id tidak ditemukan atau transaksi sudah diproses sebelumnya', [
                'order_id'           => $orderId,
                'transaction_status' => $transactionStatus,
                'transaction_id'     => $midtransTrxId,
            ]);
        }

        return response()->json(['message' => 'ok']);
    }
}