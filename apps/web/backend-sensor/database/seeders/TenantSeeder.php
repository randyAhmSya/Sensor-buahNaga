<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantSeeder extends Seeder {
    public function run(): void {
        $tenants = [
            ['tenant_id' => Str::uuid(), 'nama_tenant' => 'Agro Makmur Sejahtera', 'paket_langganan' => 'premium'],
            ['tenant_id' => Str::uuid(), 'nama_tenant' => 'Tani Mandiri Banyuwangi', 'paket_langganan' => 'trial'],
            ['tenant_id' => Str::uuid(), 'nama_tenant' => 'Dragon Fruit Paradise', 'paket_langganan' => 'enterprise'],
        ];
        foreach ($tenants as $t) {
            DB::table('tenants')->insert(array_merge($t, ['created_at' => now(), 'updated_at' => now()]));
        }
    }
}