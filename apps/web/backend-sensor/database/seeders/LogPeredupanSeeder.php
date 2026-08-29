<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LogPeredupanSeeder extends Seeder {
    public function run(): void {
        $sensors = DB::table('node_sensors')->pluck('id_sensor');
        foreach ($sensors as $sId) {
            DB::table('log_peredupans')->insert([
                'id_log_peredupan' => Str::uuid(),
                'sensor_id' => $sId,
                'presentase_redup' => 20.0,
                'nilai_lux' => 1400.0,
                'fase_bulan' => 'Bulan Purnama',
                'dicatat_pada' => now(),
                'created_at' => now(), 'updated_at' => now()
            ]);
        }
    }
}