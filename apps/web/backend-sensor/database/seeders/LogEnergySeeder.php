<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LogEnergySeeder extends Seeder {
    public function run(): void {
        $sensors = DB::table('node_sensors')->pluck('id_sensor');
        foreach ($sensors as $sId) {
            DB::table('log_energies')->insert([
                'id_log' => Str::uuid(),
                'sensor_id' => $sId,
                'konsumsi_watt' => 50.5,
                'dicatat_pada' => now(),
                'created_at' => now(), 'updated_at' => now()
            ]);
        }
    }
}