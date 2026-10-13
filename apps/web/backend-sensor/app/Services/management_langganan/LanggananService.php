<?php

namespace App\Services\management_langganan;

use App\Models\LanggananTenant;
use App\Models\PaketLangganan;
use App\Models\TransaksiLangganan;
use App\Services\management_admin\LogAktivitasService;
use App\Services\management_pembayaran\MidtransService;
use App\Traits\FileUploadTrait;
use DomainException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class LanggananService
{
    use FileUploadTrait;

    public function __construct(
        protected LogAktivitasService $logAktivitas,
        protected MidtransService $midtransService,
    ) {}

    // ===== Sisi petani =====

    public function getPaketAktif()
    {
        return PaketLangganan::where('status_aktif', true)->orderBy('tambahan_hari')->get();
    }

    public function getStatus(string $tenantId): LanggananTenant
    {
        return LanggananTenant::firstOrCreate(
            ['tenant_id' => $tenantId],
            [
                'status_langganan' => 'trial',
                'sisa_hari' => config('langganan.trial_hari', 7),
                'tanggal_aktif_terakhir' => now(),
            ]
        );
    }

    public function getRiwayat(string $tenantId, int $perPage = 15)
    {
        return TransaksiLangganan::where('tenant_id', $tenantId)->latest()->paginate($perPage);
    }

    public function ajukanPembelian(string $tenantId, string $paketId, UploadedFile $buktiTransfer): TransaksiLangganan
    {
        $paket = PaketLangganan::where('status_aktif', true)->findOrFail($paketId);

        $path = $this->uploadPrivat($buktiTransfer, 'bukti_transfer');

        return TransaksiLangganan::create([
            'tenant_id' => $tenantId,
            'paket_langganan_id' => $paket->id_paket,
            'nama_paket' => $paket->nama_paket,
            'tambahan_hari' => $paket->tambahan_hari,
            'harga' => $paket->harga,
            'metode_pembayaran' => 'manual_transfer',
            'status_pembayaran' => 'menunggu_verifikasi',
            'bukti_transfer' => $path,
        ]);
    }

    // ===== Sisi superadmin =====

    public function getTransaksiUntukAdmin(string $status = 'menunggu_verifikasi', int $perPage = 15)
    {
        $query = TransaksiLangganan::with('tenant:tenant_id,nama_tenant')
            ->where('status_pembayaran', $status);

        $query = $status === 'menunggu_verifikasi' ? $query->oldest() : $query->latest();

        return $query->paginate($perPage);
    }

    public function verifikasiPembelian(string $idTransaksi, string $adminId): TransaksiLangganan
    {
        return DB::transaction(function () use ($idTransaksi, $adminId) {
            $transaksi = TransaksiLangganan::lockForUpdate()->findOrFail($idTransaksi);

            if ($transaksi->status_pembayaran !== 'menunggu_verifikasi') {
                throw new DomainException("Transaksi ini sudah diproses (status: {$transaksi->status_pembayaran}).");
            }

            // Sengaja BUKAN getStatus() - itu ngasih trial 7 hari kalau barisnya
            // belum ada, dan verifikasi nggak boleh diam-diam nambahin trial di
            // atas hari yang dibeli kalau ini kebetulan kontak pertama tenant
            // ini sama sistem langganan.
            $langganan = $this->cariAtauBuatLanggananTanpaTrial($transaksi->tenant_id);
            $langganan = LanggananTenant::lockForUpdate()->findOrFail($langganan->id_langganan);

            $langganan->update([
                'sisa_hari' => $langganan->sisaHariAktual() + $transaksi->tambahan_hari,
                'tanggal_aktif_terakhir' => now(),
                'status_langganan' => 'aktif',
            ]);

            $transaksi->update([
                'status_pembayaran' => 'berhasil',
                'diverifikasi_oleh' => $adminId,
                'diverifikasi_pada' => now(),
            ]);

            $langganan->tenant()->update(['paket_langganan' => $transaksi->nama_paket]);

            $this->logAktivitas->catat($adminId, 'verifikasi_transaksi', 'transaksi_langganan', $transaksi->id_transaksi);

            return $transaksi;
        });
    }

    public function tolakPembelian(string $idTransaksi, string $adminId, string $alasan): TransaksiLangganan
    {
        return DB::transaction(function () use ($idTransaksi, $adminId, $alasan) {
            $transaksi = TransaksiLangganan::lockForUpdate()->findOrFail($idTransaksi);

            if ($transaksi->status_pembayaran !== 'menunggu_verifikasi') {
                throw new DomainException("Transaksi ini sudah diproses (status: {$transaksi->status_pembayaran}).");
            }

            $transaksi->update([
                'status_pembayaran' => 'ditolak',
                'alasan_penolakan' => $alasan,
                'diverifikasi_oleh' => $adminId,
                'diverifikasi_pada' => now(),
            ]);

            $this->logAktivitas->catat($adminId, 'tolak_transaksi', 'transaksi_langganan', $transaksi->id_transaksi, $alasan);

            return $transaksi;
        });
    }

    private function cariAtauBuatLanggananTanpaTrial(string $tenantId): LanggananTenant
    {
        return LanggananTenant::firstOrCreate(
            ['tenant_id' => $tenantId],
            ['status_langganan' => 'belum_aktif', 'sisa_hari' => 0, 'tanggal_aktif_terakhir' => now()]
        );
    }

    public function ajukanPembelianOnline(string $tenantId, string $paketId): array
    {
        $paket = PaketLangganan::where('status_aktif', true)->findOrFail($paketId);

        $transaksi = TransaksiLangganan::create([
            'tenant_id'          => $tenantId,
            'paket_langganan_id' => $paket->id_paket,
            'nama_paket'         => $paket->nama_paket,
            'tambahan_hari'      => $paket->tambahan_hari,
            'harga'              => $paket->harga,
            'status_pembayaran'  => 'menunggu_pembayaran',
            'metode_pembayaran'  => 'midtrans',
        ]);

        $snapToken = $this->midtransService->buatSnapToken($transaksi, (int) $paket->harga, $paket->nama_paket);

        return [
            'id_transaksi' => $transaksi->id_transaksi,
            'snap_token'   => $snapToken,
        ];
    }

    public function verifikasiOtomatisViaGateway(string $idTransaksi, string $referensiGateway): bool
    {
        return DB::transaction(function () use ($idTransaksi, $referensiGateway) {
            $transaksi = TransaksiLangganan::where('id_transaksi', $idTransaksi)->lockForUpdate()->first();

            if (!$transaksi || $transaksi->status_pembayaran !== 'menunggu_pembayaran') {
                return false;
            }

            $transaksi->update([
                'status_pembayaran' => 'diverifikasi',
                'referensi_gateway' => $referensiGateway,
                'diverifikasi_pada' => now(),
            ]);

            $langganan = $this->cariAtauBuatLanggananTanpaTrial($transaksi->tenant_id);

            $langganan->sisa_hari = $langganan->sisaHariAktual() + $transaksi->tambahan_hari; // snapshot, bukan dari relasi paket
            $langganan->tanggal_aktif_terakhir = now();
            $langganan->save();

            return true;
        });
    }

    public function tolakOtomatisViaGateway(string $idTransaksi, string $alasan): bool
    {
        $jumlahDiubah = TransaksiLangganan::where('id_transaksi', $idTransaksi)
            ->where('status_pembayaran', 'menunggu_pembayaran')
            ->update([
                'status_pembayaran' => 'ditolak',
                'alasan_penolakan'  => $alasan,
                'diverifikasi_pada' => now(),
            ]);

        return $jumlahDiubah > 0;
    }
}
