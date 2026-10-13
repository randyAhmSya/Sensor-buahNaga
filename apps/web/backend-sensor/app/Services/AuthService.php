<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant;

class AuthService
{
    public function registerUser(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Buat perusahaannya dulu
            $tenant = Tenant::create([
                'nama_tenant' => $data['nama_tenant'],
                'paket_langganan' => 'gratis'
            ]);

            // 2. Buat user-nya, lalu hubungkan dengan ID perusahaan yang baru dibuat
            return User::create([
                'tenant_id' => $tenant->tenant_id,
                'nama_lengkap' => $data['nama_lengkap'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'petani_biasa'
            ]);
        });
    }
    public function checkCredential($email, $password)
    {
        $user = User::where('email', $email)->first();
        if (! $user || ! Hash::check($password, $user->password)) {
            return false;
        }
        return $user;
    }

    public function createNewToken(User $user)
    {
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;
        return $token;
    }
}
