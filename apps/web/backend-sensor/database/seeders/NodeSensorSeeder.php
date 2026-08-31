<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NodeSensorSeeder extends Seeder
{
    public function run(): void
    {
        $gateways = DB::table('gateways')->get();
        $qrs = DB::table('kode_qrs')->pluck('id_qr');
        $bloks = DB::table('bloks')->get();

        foreach ($gateways as $index => $g) {
            DB::table('node_sensors')->insert([
                'id_sensor' => Str::uuid(),
                'blok_id' => $bloks[$index]->id_blok,
                'gateway_id' => $g->id_gateway,
                'qr_id' => $qrs[$index] ?? $qrs[0],
                'kode_perangkat' => 'SNS-LIGHT-' . ($index + 1),
                'kode_pairing' => Str::upper(Str::random(6)),
                'token_perangkat' => Str::random(32),
                'tipe_sensor' => 'Lux & Temp Sensor',
                'status_koneksi' => 'CONNECTED',
                'terakhir_terlihat' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}

