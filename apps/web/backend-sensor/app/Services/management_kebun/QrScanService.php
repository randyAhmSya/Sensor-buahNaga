<?php
 
namespace App\Services\management_kebun;
 
use App\Models\KodeQr;
use App\Models\QrScanLog;
use Illuminate\Support\Facades\Auth;
 
class QrScanService
{
    /**
     * Resolve teks_kode_qr menjadi data blok/sensor, sekaligus mencatat
     * setiap percobaan scan (berhasil ataupun ditolak) ke qr_scan_logs.
     */
    public function scan(string $teksKodeQr, array $meta = []): array
    {
        $user = Auth::user();
 
        $qr = KodeQr::where('teks_kode_qr', $teksKodeQr)->first();
 
        if (!$qr || !$qr->status_qr) {
            $this->logScan(null, $user, 'ditolak_qr_nonaktif', $meta);
            return ['success' => false, 'message' => 'Kode QR tidak ditemukan atau sudah nonaktif.'];
        }
 
        // asumsi: NodeSensor punya relasi blok(), Blok punya relasi kebun()
        // sesuaikan nama relasi ini kalau berbeda di model kamu
        $nodeSensor = $qr->nodeSensor()->with('blok.kebun')->first();
 
        if (!$nodeSensor) {
            $this->logScan($qr->id_qr, $user, 'ditolak_qr_tidak_terpasang', $meta);
            return ['success' => false, 'message' => 'QR belum terpasang ke node sensor manapun.'];
        }
 
        $tenantIdResource = $nodeSensor->blok->kebun->tenant_id;
 
        if ($user->tenant_id !== $tenantIdResource) {
            $this->logScan($qr->id_qr, $user, 'ditolak_beda_tenant', $meta);
            return ['success' => false, 'message' => 'Anda tidak memiliki akses ke blok ini.'];
        }
 
        $this->logScan($qr->id_qr, $user, 'berhasil', $meta);
 
        return ['success' => true, 'data' => $nodeSensor];
    }
 
    protected function logScan(?string $qrId, $user, string $status, array $meta = []): void
    {
        QrScanLog::create([
            'qr_id'               => $qrId,
            'user_id'             => $user?->id,
            'nama_user_saat_scan' => $user?->nama_lengkap,
            'status_scan'         => $status,
            'platform'            => $meta['platform'] ?? null,
            'ip_address'          => $meta['ip_address'] ?? null,
            'latitude'            => $meta['latitude'] ?? null,
            'longitude'           => $meta['longitude'] ?? null,
            'dicatat_pada'        => now(),
        ]);
    }
}