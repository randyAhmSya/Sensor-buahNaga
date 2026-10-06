<?php

namespace App\Services\management_notifikasi;

use App\Models\Notifikasi;

class NotifikasiService
{
    public function getUntukTenant(string $tenantId, bool $hanyaBelumDibaca = false, int $perPage = 15)
    {
        $query = Notifikasi::where('tenant_id', $tenantId)->latest();

        if ($hanyaBelumDibaca) {
            $query->where('sudah_dibaca', false);
        }

        return $query->paginate($perPage);
    }

    public function tandaiDibaca(Notifikasi $notifikasi): Notifikasi
    {
        $notifikasi->update(['sudah_dibaca' => true, 'dibaca_pada' => now()]);
        return $notifikasi;
    }

    public function tandaiSemuaDibaca(string $tenantId): int
    {
        return Notifikasi::where('tenant_id', $tenantId)
            ->where('sudah_dibaca', false)
            ->update(['sudah_dibaca' => true, 'dibaca_pada' => now()]);
    }
}