<?php

namespace App\Services\management_kebun;

use App\Models\kebun;
use Illuminate\Database\Eloquent\Collection;

class KebunService
{
    public function getAllKebun(?string $tenantId = null): Collection
    {
        return kebun::when($tenantId, function ($query, $tenantId) {
            return $query->where('tenant_id', $tenantId);
        })->latest()->get();
    }

    public function getKebunById(string $idKebun): ?kebun
    {
        return kebun::find($idKebun);
    }

    public function createKebun(string $tenantId, array $data): kebun
    {
        $data['tenant_id'] = $tenantId;
        return kebun::create($data);
    }

    public function updateKebun(kebun $kebun, array $data): kebun
    {
        $kebun->update($data);
        return $kebun->fresh();
    }

    public function deleteKebun(kebun $kebun): bool
    {
        return (bool) $kebun->delete();
    }
}
