<?php

namespace App\Services\management_pembayaran;

use App\Models\TransaksiLangganan;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized  = true;
        Config::$is3ds        = true;

         \Log::info('Server key length: ' . strlen(config('services.midtrans.server_key')));
    }

    public function buatSnapToken(TransaksiLangganan $transaksi, int $grossAmount, string $namaPaket): string
    {
        $params = [
            'transaction_details' => [
                'order_id'     => $transaksi->id_transaksi,
                'gross_amount' => $grossAmount,
            ],
            'item_details' => [[
                'id'       => $transaksi->paket_langganan_id,
                'price'    => $grossAmount,
                'quantity' => 1,
                'name'     => $namaPaket,
            ]],
            'customer_details' => [
                'first_name' => optional($transaksi->tenant)->nama_tenant ?? 'Petani AgroLight',
            ],
        ];

        return Snap::getSnapToken($params);
    }

    public function verifikasiSignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $serverKey = config('services.midtrans.server_key');
        $hashed = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return hash_equals($hashed, $signatureKey);
    }
}