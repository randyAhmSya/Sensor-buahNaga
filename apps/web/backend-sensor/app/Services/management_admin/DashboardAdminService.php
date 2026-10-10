<?php

namespace App\Services\management_admin;

use App\Models\Tenant;
use App\Models\User;
use App\Models\LanggananTenant;
use App\Models\TransaksiLangganan;
use App\Models\Kebun;
use App\Models\Blok;
use App\Models\Gateway;
use App\Models\NodeSensor;
use App\Models\LogAktivitasAdmin;

class DashboardAdminService
{
    public function getRingkasan(): array
    {
        return [
            'tenant'            => $this->ringkasanTenant(),
            'user'              => $this->ringkasanUser(),
            'langganan'         => $this->ringkasanLangganan(),
            'transaksi'         => $this->ringkasanTransaksi(),
            'infrastruktur'     => $this->ringkasanInfrastruktur(),
            'aktivitas_terbaru' => $this->aktivitasTerbaru(),
        ];
    }

    private function ringkasanTenant(): array
    {
        return [
            'total'    => Tenant::count(),
            'aktif'    => Tenant::where('is_aktif', true)->count(),
            'nonaktif' => Tenant::where('is_aktif', false)->count(),
        ];
    }

    private function ringkasanUser(): array
    {
        return [
            'total'    => User::count(),
            'aktif'    => User::where('is_aktif', true)->count(),
            'nonaktif' => User::where('is_aktif', false)->count(),
            'per_role' => User::select('role')
                ->selectRaw('count(*) as total')
                ->groupBy('role')
                ->pluck('total', 'role'),
        ];
    }

    private function ringkasanLangganan(): array
    {
        $counter = ['aktif' => 0, 'tenggang' => 0, 'kadaluarsa' => 0];

        LanggananTenant::select('id_langganan', 'tenant_id', 'status_langganan', 'sisa_hari', 'tanggal_aktif_terakhir')
            ->chunk(200, function ($batch) use (&$counter) {
                foreach ($batch as $langganan) {
                    $status = $langganan->statusEfektif();
                    if (isset($counter[$status])) {
                        $counter[$status]++;
                    }
                }
            });

        return [
            'total'      => array_sum($counter),
            'aktif'      => $counter['aktif'],
            'tenggang'   => $counter['tenggang'],
            'kadaluarsa' => $counter['kadaluarsa'],
        ];
    }

    private function ringkasanTransaksi(): array
    {
        return [
            'total'               => TransaksiLangganan::count(),
            'menunggu_pembayaran' => TransaksiLangganan::where('status_pembayaran', 'menunggu_pembayaran')->count(),
            'diverifikasi'        => TransaksiLangganan::where('status_pembayaran', 'diverifikasi')->count(),
            'ditolak'             => TransaksiLangganan::where('status_pembayaran', 'ditolak')->count(),
            'pendapatan_total'    => (float) TransaksiLangganan::where('status_pembayaran', 'diverifikasi')->sum('harga'),
        ];
    }

    private function ringkasanInfrastruktur(): array
    {
        return [
            'kebun' => [
                'total'    => Kebun::count(),
                'aktif'    => Kebun::where('status_kebun', true)->count(),
                'nonaktif' => Kebun::where('status_kebun', false)->count(),
            ],
            'blok' => [
                'total' => Blok::count(),
            ],
            'gateway' => [
                'total'      => Gateway::count(),
                'per_status' => Gateway::select('status_koneksi')
                    ->selectRaw('count(*) as total')
                    ->groupBy('status_koneksi')
                    ->pluck('total', 'status_koneksi'),
            ],
            'node_sensor' => [
                'total'      => NodeSensor::count(),
                'per_status' => NodeSensor::select('status_koneksi')
                    ->selectRaw('count(*) as total')
                    ->groupBy('status_koneksi')
                    ->pluck('total', 'status_koneksi'),
                'per_tipe'   => NodeSensor::select('tipe_sensor')
                    ->selectRaw('count(*) as total')
                    ->groupBy('tipe_sensor')
                    ->pluck('total', 'tipe_sensor'),
            ],
        ];
    }

    private function aktivitasTerbaru(int $limit = 10)
    {
        return LogAktivitasAdmin::with('admin:id,nama_lengkap')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (LogAktivitasAdmin $log) => [
                'id_log'      => $log->id_log,
                'admin'       => $log->admin->nama_lengkap ?? 'Tidak diketahui',
                'aksi'        => $log->aksi,
                'target_tipe' => $log->target_tipe,
                'target_id'   => $log->target_id,
                'keterangan'  => $log->keterangan,
                'waktu'       => $log->created_at,
            ]);
    }
}