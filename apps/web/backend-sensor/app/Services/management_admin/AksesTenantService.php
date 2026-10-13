<?php

namespace App\Services\management_admin;

use App\Models\AksesTenantAdmin;
use App\Models\User;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AksesTenantService
{
    public function bolehAkses(string $tenantId, string $adminId): bool
    {
        return AksesTenantAdmin::where('tenant_id', $tenantId)
            ->where('admin_id', $adminId)
            ->where('status', 'disetujui')
            ->exists();
    }

    public function pastikanBolehAkses(string $tenantId, string $adminId): void
    {
        if (!$this->bolehAkses($tenantId, $adminId)) {
            throw new AuthorizationException('Belum ada izin akses dari tenant ini. Ajukan permintaan akses dulu.');
        }
    }

    public function ajukan(string $tenantId, string $adminId, ?string $alasan = null): AksesTenantAdmin
    {
        $sudahAda = AksesTenantAdmin::where('tenant_id', $tenantId)
            ->where('admin_id', $adminId)
            ->whereIn('status', ['pending', 'disetujui'])
            ->exists();

        if ($sudahAda) {
            throw new DomainException('Sudah ada permintaan yang menunggu atau akses yang masih aktif untuk tenant ini.');
        }

        return AksesTenantAdmin::create([
            'tenant_id'         => $tenantId,
            'admin_id'          => $adminId,
            'status'            => 'pending',
            'alasan_permintaan' => $alasan,
            'diminta_pada'      => now(),
        ]);
    }

    public function setujui(string $id, User $petani): AksesTenantAdmin
    {
        return DB::transaction(function () use ($id, $petani) {
            $akses = AksesTenantAdmin::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($akses->tenant_id !== $petani->tenant_id) {
                throw new AuthorizationException('Permintaan ini bukan untuk tenant kamu.');
            }

            if ($akses->status !== 'pending') {
                throw new DomainException("Permintaan ini sudah diproses sebelumnya (status: {$akses->status}).");
            }

            $akses->update([
                'status'          => 'disetujui',
                'diputuskan_pada' => now(),
                'diputuskan_oleh' => $petani->id,
            ]);

            return $akses;
        });
    }

    public function tolak(string $id, User $petani, ?string $alasan = null): AksesTenantAdmin
    {
        return DB::transaction(function () use ($id, $petani, $alasan) {
            $akses = AksesTenantAdmin::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($akses->tenant_id !== $petani->tenant_id) {
                throw new AuthorizationException('Permintaan ini bukan untuk tenant kamu.');
            }

            if ($akses->status !== 'pending') {
                throw new DomainException("Permintaan ini sudah diproses sebelumnya (status: {$akses->status}).");
            }

            $akses->update([
                'status'           => 'ditolak',
                'alasan_penolakan' => $alasan,
                'diputuskan_pada'  => now(),
                'diputuskan_oleh'  => $petani->id,
            ]);

            return $akses;
        });
    }

    public function cabut(string $id, User $petani): AksesTenantAdmin
    {
        return DB::transaction(function () use ($id, $petani) {
            $akses = AksesTenantAdmin::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($akses->tenant_id !== $petani->tenant_id) {
                throw new AuthorizationException('Akses ini bukan milik tenant kamu.');
            }

            if ($akses->status !== 'disetujui') {
                throw new DomainException("Akses ini nggak dalam status aktif (status: {$akses->status}).");
            }

            $akses->update([
                'status'          => 'dicabut',
                'diputuskan_pada' => now(),
                'diputuskan_oleh' => $petani->id,
            ]);

            return $akses;
        });
    }

    public function riwayatTenant(string $tenantId): Collection
    {
        return AksesTenantAdmin::with('admin:id,nama_lengkap')
            ->where('tenant_id', $tenantId)
            ->latest('diminta_pada')
            ->get();
    }

    public function riwayatAdmin(string $adminId): Collection
    {
        return AksesTenantAdmin::with('tenant:tenant_id,nama_tenant')
            ->where('admin_id', $adminId)
            ->latest('diminta_pada')
            ->get();
    }
}
