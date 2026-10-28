<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil daftar tenant_id yang ada di tabel tenants
        $tenants = DB::table('tenants')->pluck('tenant_id')->toArray();

        // Fallback aman: Jika tabel tenants belum memiliki minimal 3 data,
        // gunakan nilai yang tersedia atau null agar tidak error Undefined array key
        $tenantAdmin   = $tenants[0] ?? null;
        $tenantPetani1 = $tenants[1] ?? ($tenants[0] ?? null);
        $tenantPetani2 = $tenants[2] ?? ($tenants[0] ?? null);

        $users = [
            [
                'id'                => (string) Str::uuid(),
                'tenant_id'         => $tenantAdmin,
                'nama_lengkap'      => 'Super Admin Agrolight',
                'email'             => 'admin@agrolight.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('password123'),
                'nomor_telepon'     => '081234567890',
                'url_foto'          => null,
                'role'              => 'superAdmin',
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'id'                => (string) Str::uuid(),
                'tenant_id'         => $tenantPetani1,
                'nama_lengkap'      => 'Pak Tani Budiman',
                'email'             => 'petani1@agrolight.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('password123'),
                'nomor_telepon'     => '081234567891',
                'url_foto'          => null,
                'role'              => 'user',
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'id'                => (string) Str::uuid(),
                'tenant_id'         => $tenantPetani2,
                'nama_lengkap'      => 'Ibu Tani Lestari',
                'email'             => 'petani2@agrolight.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('password123'),
                'nomor_telepon'     => '081234567892',
                'url_foto'          => null,
                'role'              => 'user',
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['email' => $user['email']], // Cek berdasarkan email unik
                $user
            );
        }
    }
}