<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder {
    public function run(): void {
        $tenants = DB::table('tenants')->pluck('tenant_id');
        DB::table('users')->insert([
            [
                'id' => Str::uuid(), 'tenant_id' => $tenants[0],
                'nama_lengkap' => 'Super Admin Agrolight', 'email' => 'admin@agrolight.com',
                'password' => Hash::make('password123'), 'role' => 'superAdmin',
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'id' => Str::uuid(), 'tenant_id' => $tenants[1],
                'nama_lengkap' => 'Pak Tani Budiman', 'email' => 'petani1@agrolight.com',
                'password' => Hash::make('password123'), 'role' => 'user',
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'id' => Str::uuid(), 'tenant_id' => $tenants[2],
                'nama_lengkap' => 'Ibu Tani Lestari', 'email' => 'petani2@agrolight.com',
                'password' => Hash::make('password123'), 'role' => 'user',
                'created_at' => now(), 'updated_at' => now()
            ],
        ]);
    }
}