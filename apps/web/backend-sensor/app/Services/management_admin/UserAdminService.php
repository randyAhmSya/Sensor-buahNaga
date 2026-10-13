<?php

namespace App\Services\management_admin;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserAdminService
{
    public function __construct(protected LogAktivitasService $logAktivitas) {}

    public function getSemuaUser(?string $tenantId = null, ?string $role = null, int $perPage = 15)
    {
        $query = User::with('tenant:tenant_id,nama_tenant')->latest();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        if ($role) {
            $query->where('role', $role);
        }

        return $query->paginate($perPage);
    }

    public function getUserById(string $id): ?User
    {
        return User::with('tenant:tenant_id,nama_tenant')->find($id);
    }

    public function buatUser(array $data, string $adminId): User
    {
        $user = User::create([
            'tenant_id' => $data['tenant_id'] ?? null,
            'nama_lengkap' => $data['nama_lengkap'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        $this->logAktivitas->catat($adminId, 'buat_user', 'user', $user->id, "role: {$user->role}");

        return $user;
    }

    public function nonaktifkanUser(User $user, string $adminId): User
    {
        $user->update(['is_aktif' => false]);
        $user->tokens()->delete(); // langsung putus sesi yang lagi aktif
        $this->logAktivitas->catat($adminId, 'nonaktifkan_user', 'user', $user->id);
        return $user;
    }

    public function aktifkanUser(User $user, string $adminId): User
    {
        $user->update(['is_aktif' => true]);
        $this->logAktivitas->catat($adminId, 'aktifkan_user', 'user', $user->id);
        return $user;
    }
}
