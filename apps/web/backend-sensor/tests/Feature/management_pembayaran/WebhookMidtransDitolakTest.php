<?php

namespace Tests\Feature\management_pembayaran;

use App\Models\Tenant;
use App\Models\TransaksiLangganan;
use App\Models\LanggananTenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Tests\TestCase;
use Illuminate\Support\Facades\Log;

class WebhookMidtransDitolakTest extends TestCase
{
    use RefreshDatabase;

    private string $serverKey = 'test-server-key-untuk-unit-test';

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.midtrans.server_key', $this->serverKey);
    }

    private function buatTenant(array $overrides = []): Tenant
    {
        return Tenant::create(array_merge([
            'tenant_id'   => (string) Str::uuid(),
            'nama_tenant' => 'Tenant Uji ' . Str::random(6),
            'is_aktif'    => true,
        ], $overrides));
    }

    private function buatTransaksiMenungguPembayaran(string $tenantId): TransaksiLangganan
    {
        return TransaksiLangganan::create([
            'id_transaksi'      => (string) Str::uuid(),
            'tenant_id'         => $tenantId,
            'nama_paket'        => 'Paket Uji',
            'tambahan_hari'     => 30,
            'harga'             => 50000,
            'status_pembayaran' => 'menunggu_pembayaran',
            'metode_pembayaran' => 'midtrans',
        ]);
    }

    private function kirimWebhook(
        string $orderId,
        string $transactionStatus,
        ?string $fraudStatus = null,
        string $grossAmount = '50000.00',
        string $statusCode = '201'
    ) {
        $signature = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        $payload = [
            'order_id'           => $orderId,
            'status_code'        => $statusCode,
            'gross_amount'       => $grossAmount,
            'signature_key'      => $signature,
            'transaction_status' => $transactionStatus,
            'transaction_id'     => (string) Str::uuid(),
        ];

        if ($fraudStatus !== null) {
            $payload['fraud_status'] = $fraudStatus;
        }

        return $this->postJson('/api/webhook/midtrans', $payload);
    }

    public function test_webhook_expire_menolak_transaksi_dan_tidak_menyentuh_langganan(): void
    {
        $tenant = $this->buatTenant();
        $transaksi = $this->buatTransaksiMenungguPembayaran($tenant->tenant_id);

        $response = $this->kirimWebhook($transaksi->id_transaksi, 'expire');

        $response->assertOk()->assertJson(['message' => 'ok']);

        $transaksi->refresh();
        $this->assertEquals('ditolak', $transaksi->status_pembayaran);
        $this->assertNotNull($transaksi->alasan_penolakan);
        $this->assertNotNull($transaksi->diverifikasi_pada);

        // Pastikan jalur ditolak nggak diam-diam bikin/ubah baris langganan tenant
        $this->assertFalse(LanggananTenant::where('tenant_id', $tenant->tenant_id)->exists());
    }

    public function test_webhook_deny_menolak_transaksi(): void
    {
        $tenant = $this->buatTenant();
        $transaksi = $this->buatTransaksiMenungguPembayaran($tenant->tenant_id);

        $response = $this->kirimWebhook($transaksi->id_transaksi, 'deny');

        $response->assertOk();
        $transaksi->refresh();
        $this->assertEquals('ditolak', $transaksi->status_pembayaran);
    }

    public function test_webhook_cancel_menolak_transaksi(): void
    {
        $tenant = $this->buatTenant();
        $transaksi = $this->buatTransaksiMenungguPembayaran($tenant->tenant_id);

        $response = $this->kirimWebhook($transaksi->id_transaksi, 'cancel');

        $response->assertOk();
        $transaksi->refresh();
        $this->assertEquals('ditolak', $transaksi->status_pembayaran);
    }

    public function test_webhook_pending_tidak_mengubah_status(): void
    {
        $tenant = $this->buatTenant();
        $transaksi = $this->buatTransaksiMenungguPembayaran($tenant->tenant_id);

        $response = $this->kirimWebhook($transaksi->id_transaksi, 'pending');

        $response->assertOk();
        $transaksi->refresh();
        $this->assertEquals('menunggu_pembayaran', $transaksi->status_pembayaran);
    }

    public function test_webhook_expire_dikirim_ulang_tidak_mengubah_apa_apa_lagi(): void
    {
        $tenant = $this->buatTenant();
        $transaksi = $this->buatTransaksiMenungguPembayaran($tenant->tenant_id);

        $this->kirimWebhook($transaksi->id_transaksi, 'expire');
        $transaksi->refresh();
        $alasanPertama = $transaksi->alasan_penolakan;
        $waktuPertama  = $transaksi->diverifikasi_pada;

        // Midtrans lazim kirim notifikasi yang sama lebih dari sekali
        $this->kirimWebhook($transaksi->id_transaksi, 'expire');
        $transaksi->refresh();

        $this->assertEquals('ditolak', $transaksi->status_pembayaran);
        $this->assertEquals($alasanPertama, $transaksi->alasan_penolakan);
        $this->assertEquals($waktuPertama, $transaksi->diverifikasi_pada);
    }

    public function test_webhook_signature_tidak_valid_ditolak_dengan_403(): void
    {
        $tenant = $this->buatTenant();
        $transaksi = $this->buatTransaksiMenungguPembayaran($tenant->tenant_id);

        $response = $this->postJson('/api/webhook/midtrans', [
            'order_id'           => $transaksi->id_transaksi,
            'status_code'        => '201',
            'gross_amount'       => '50000.00',
            'signature_key'      => 'signature-ngasal',
            'transaction_status' => 'expire',
        ]);

        $response->assertStatus(403);

        $transaksi->refresh();
        $this->assertEquals('menunggu_pembayaran', $transaksi->status_pembayaran);
    }

    public function test_webhook_mencatat_log_saat_order_id_tidak_ditemukan_untuk_jalur_ditolak(): void
{
    Log::spy();

    $response = $this->kirimWebhook((string) Str::uuid(), 'expire'); // order_id yang memang nggak pernah ada

    $response->assertOk(); // tetap balas "ok" ke Midtrans, sesuai konvensi webhook
    Log::shouldHaveReceived('warning')->once();
}

public function test_webhook_mencatat_log_saat_order_id_tidak_ditemukan_untuk_jalur_sukses(): void
{
    Log::spy();

    $response = $this->kirimWebhook((string) Str::uuid(), 'settlement');

    $response->assertOk();
    Log::shouldHaveReceived('warning')->once();
}
}