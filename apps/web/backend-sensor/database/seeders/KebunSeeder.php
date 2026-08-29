<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KebunSeeder extends Seeder {
    public function run(): void {
        $tenants = DB::table('tenants')->pluck('tenant_id');
        foreach ($tenants as $index => $tId) {
            for ($i = 1; $i <= 2; $i++) {
                DB::table('kebuns')->insert([
                    'id_kebun' => Str::uuid(),
                    'tenant_id' => $tId,
                    'nama_kebun' => 'Kebun Buah Naga ' . ($index + 1) . ' - Area ' . $i,
                    'lokasi_kebun' => 'Banyuwangi, Jatim',
                    'status_kebun' => true,
                    'created_at' => now(), 'updated_at' => now()
                ]);
            }
        }
    }
}