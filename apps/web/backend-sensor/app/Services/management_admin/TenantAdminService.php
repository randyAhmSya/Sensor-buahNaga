<?php

namespace App\Services\management_admin;

use App\Models\kebun;
use App\Models\LanggananTenant;
use App\Models\Tenant;
use App\Models\User;

class TenantAdminService
{
    public function __construct(protected LogAktivitasService $logAktivitas) {}

    public function getSemuaTenant(int $perPage = 15)
    {
        $paginator = Tenant::orderBy('nama_tenant')->paginate($perPage);
        $paginator->getCollection()->transform(fn ($t) => $this->formatRingkasan($t));
        return $paginator;
    }

    public function getDetailTenant(string $tenantId): ?array
    {
        $tenant = Tenant::find($tenantId);
        if (!$tenant) {
            return null;
        }

        $ringkasan = $this->formatRingkasan($tenant);
        $ringkasan['kebun'] = kebun::where('tenant_id', $tenantId)->get(['id_kebun', 'nama_kebun']);
        $ringkasan['user'] = User::where('tenant_id', $tenantId)->get(['id', 'nama_lengkap', 'email', 'role']);

        return $ringkasan;
    }

    public function nonaktifkanTenant(Tenant $tenant, string $adminId): Tenant
    {
        $tenant->update(['is_aktif' => false]);
        $this->logAktivitas->catat($adminId, 'nonaktifkan_tenant', 'tenant', $tenant->tenant_id);
        return $tenant;
    }

    public function aktifkanTenant(Tenant $tenant, string $adminId): Tenant
    {
        $tenant->update(['is_aktif' => true]);
        $this->logAktivitas->catat($adminId, 'aktifkan_tenant', 'tenant', $tenant->tenant_id);
        return $tenant;
    }

    protected function formatRingkasan(Tenant $tenant): array
    {
        $langganan = LanggananTenant::where('tenant_id', $tenant->tenant_id)->first();

        return [
            'tenant_id' => $tenant->tenant_id,
            'nama_tenant' => $tenant->nama_tenant,
            'is_aktif' => $tenant->is_aktif,
            'is_admin_allowed' => $tenant->is_admin_allowed,
            'paket_langganan' => $tenant->paket_langganan,
            'status_langganan' => $langganan?->statusEfektif() ?? 'belum_pernah_aktif',
            'sisa_hari' => $langganan?->sisaHariAktual() ?? 0,
            'jumlah_kebun' => kebun::where('tenant_id', $tenant->tenant_id)->count(),
            'jumlah_user' => User::where('tenant_id', $tenant->tenant_id)->count(),
            'created_at' => $tenant->created_at,
        ];
    }
}