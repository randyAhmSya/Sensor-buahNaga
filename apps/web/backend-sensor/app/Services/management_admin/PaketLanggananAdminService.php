<?php

namespace App\Services\management_admin;

use App\Models\PaketLangganan;
use App\Models\TransaksiLangganan;
use DomainException;

class PaketLanggananAdminService
{
    public function __construct(protected LogAktivitasService $logAktivitas) {}

    public function getSemuaPaket()
    {
        return PaketLangganan::orderByDesc('status_aktif')->orderBy('tambahan_hari')->get();
    }

    public function getPaketById(string $id): ?PaketLangganan
    {
        return PaketLangganan::find($id);
    }

    public function buatPaket(array $data, string $adminId): PaketLangganan
    {
        $data['status_aktif'] = $data['status_aktif'] ?? true;
        $paket = PaketLangganan::create($data);

        $this->logAktivitas->catat($adminId, 'buat_paket', 'paket_langganan', $paket->id_paket);

        return $paket;
    }

    public function updatePaket(PaketLangganan $paket, array $data, string $adminId): PaketLangganan
    {
        $paket->update($data);
        $this->logAktivitas->catat($adminId, 'update_paket', 'paket_langganan', $paket->id_paket);
        return $paket;
    }

    public function nonaktifkanPaket(PaketLangganan $paket, string $adminId): PaketLangganan
    {
        $paket->update(['status_aktif' => false]);
        $this->logAktivitas->catat($adminId, 'nonaktifkan_paket', 'paket_langganan', $paket->id_paket);
        return $paket;
    }

    public function aktifkanPaket(PaketLangganan $paket, string $adminId): PaketLangganan
    {
        $paket->update(['status_aktif' => true]);
        $this->logAktivitas->catat($adminId, 'aktifkan_paket', 'paket_langganan', $paket->id_paket);
        return $paket;
    }

    public function hapusPaket(PaketLangganan $paket, string $adminId): void
    {
        $pernahDipakai = TransaksiLangganan::where('paket_langganan_id', $paket->id_paket)->exists();

        if ($pernahDipakai) {
            throw new DomainException('Paket ini sudah pernah dipakai di transaksi - nonaktifkan saja, jangan dihapus.');
        }

        $idPaket = $paket->id_paket;
        $paket->delete();

        $this->logAktivitas->catat($adminId, 'hapus_paket', 'paket_langganan', $idPaket);
    }
}
