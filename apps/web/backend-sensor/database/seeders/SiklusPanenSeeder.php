<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SiklusPanenSeeder extends Seeder {
    public function run(): void {
        $bloks = DB::table('bloks')->pluck('id_blok');
        foreach ($bloks as $bId) {
            DB::table('siklus_panens')->insert([
                'id_siklus_panen' => Str::uuid(),
                'block_id' => $bId,
                'tanggal_penyinaran' => now()->subDays(5),
                'target_hari_berbunga' => 40,
                'estimasi_tanggal_panen' => now()->addDays(35),
                'status_siklus' => 'BERJALAN',
                'created_at' => now(), 'updated_at' => now()
            ]);
        }
    }
}