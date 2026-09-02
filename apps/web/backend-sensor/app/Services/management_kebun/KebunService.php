<?php

namespace App\Services\management_kebun;

use App\Models\kebun;
use App\Traits\FileUploadTrait;
use Illuminate\Database\Eloquent\Collection;

class KebunService
{
    use FileUploadTrait;
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

    public function createKebun(string $tenantId, array $data, $fileFoto = null): kebun
    {
        $data['tenant_id'] = $tenantId;

        if ($fileFoto) {
            // Gunakan folder yang berbeda agar rapi
            $data['url_foto'] = $this->uploadFoto($fileFoto, 'foto_kebun');
        }
        return kebun::create($data);
    }

    public function updateKebun(kebun $kebun, array $data, $fileFoto = null): kebun
    {
        if ($fileFoto) {
            $data['url_foto'] = $this->uploadFoto($fileFoto, 'foto_kebun', $kebun->url_foto);
        }
        $kebun->update($data);
        return $kebun->fresh();
    }

    public function deleteKebun(kebun $kebun): bool
    {
        $this->hapusFoto($kebun->url_foto);
        return (bool) $kebun->delete();
    }
}
