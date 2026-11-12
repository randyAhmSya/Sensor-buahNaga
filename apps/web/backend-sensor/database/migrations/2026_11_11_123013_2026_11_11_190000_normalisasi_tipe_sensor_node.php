<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Menyamakan data lama dengan daftar tipe sensor yang sah (lux_suhu, cahaya).
 * Halaman tambah node versi lama mengirim "cahaya_lux", seeder lama memakai
 * "Lux & Temp Sensor". Nilai lain yang tidak dikenal tidak diubah.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('node_sensors')->whereIn('tipe_sensor', ['cahaya_lux', 'lux'])->update(['tipe_sensor' => 'cahaya']);
        DB::table('node_sensors')->where('tipe_sensor', 'Lux & Temp Sensor')->update(['tipe_sensor' => 'lux_suhu']);
    }

    public function down(): void
    {
    }
};
