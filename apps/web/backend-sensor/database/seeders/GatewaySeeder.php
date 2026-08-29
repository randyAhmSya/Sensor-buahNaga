<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GatewaySeeder extends Seeder {
    public function run(): void {
        $bloks = DB::table('bloks')->get();
        foreach ($bloks as $index => $b) {
            DB::table('gateways')->insert([
                'id_gateway' => Str::uuid(),
                'blok_id' => $b->id_blok,
                'kode_perangkat' => 'GW-BWI-' . ($index + 1),
                'status_koneksi' => 'ONLINE',
                'terakhir_terlihat' => now(),
                'created_at' => now(), 'updated_at' => now()
            ]);
        }
    }
}