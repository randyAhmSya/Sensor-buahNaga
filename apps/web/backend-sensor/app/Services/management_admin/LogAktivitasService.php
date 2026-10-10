<?php

namespace App\Services\management_admin;

use App\Models\LogAktivitasAdmin;

class LogAktivitasService
{
    public function catat(string $adminId, string $aksi, string $targetTipe, string $targetId, ?string $keterangan = null): LogAktivitasAdmin
    {
        return LogAktivitasAdmin::create([
            'admin_id' => $adminId,
            'aksi' => $aksi,
            'target_tipe' => $targetTipe,
            'target_id' => $targetId,
            'keterangan' => $keterangan,
        ]);
    }

    public function getSemua(int $perPage = 15)
    {
        return LogAktivitasAdmin::with('admin:id,nama_lengkap,email')->latest()->paginate($perPage);
    }
}