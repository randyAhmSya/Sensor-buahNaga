<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LanggananTenantSeeder extends Seeder {
    public function run(): void {
        $tenants = DB::table('tenants')->pluck('tenant_id');
        foreach ($tenants as $id) {
            DB::table('langganan_tenants')->insert([
                'id_langganan' => Str::uuid(),
                'tenant_id' => $id,
                'status_langganan' => 'ACTIVE',
                'sisa_hari' => 25,
                'tanggal_aktif_terakhir' => now(),
                'created_at' => now(), 'updated_at' => now()
            ]);
        }
    }
}