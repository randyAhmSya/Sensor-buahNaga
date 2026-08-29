<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReadSensorSeeder extends Seeder {
    public function run(): void {
        $sensors = DB::table('node_sensors')->pluck('id_sensor');
        foreach ($sensors as $sId) {
            for ($i = 0; $i < 3; $i++) {
                DB::table('read__sensors')->insert([
                    'id_read_sensor' => Str::uuid(),
                    'sensor_id' => $sId,
                    'nilai_lux' => rand(1200, 1800) + 0.5,
                    'suhu' => rand(26, 32) + 0.5,
                    'dicatat_pada' => now()->subHours($i),
                    'created_at' => now(), 'updated_at' => now()
                ]);
            }
        }
    }
}