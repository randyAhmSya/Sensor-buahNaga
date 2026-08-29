<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JadwalLampuSeeder extends Seeder {
    public function run(): void {
        $sensors = DB::table('node_sensors')->pluck('id_sensor');
        foreach ($sensors as $sId) {
            DB::table('jadwal_lampus')->insert([
                'id_jadwal_lampu' => Str::uuid(),
                'sensor_id' => $sId,
                'waktu_mulai_nyala' => now()->setTime(18, 0, 0),
                'waktu_akhir_nyala' => now()->addHours(6)->setTime(0, 0, 0),
                'instensitas_cahaya' => 85.0,
                'created_at' => now(), 'updated_at' => now()
            ]);
        }
    }
}