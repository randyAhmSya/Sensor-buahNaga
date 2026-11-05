<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Pendukung retensi data sensor:
 *  - ringkasan HARIAN per node, ditulis oleh `lampu:pangkas-data` SEBELUM baris mentah
 *    yang melewati masa retensi dihapus (riwayat jangka panjang tetap ada);
 *  - indeks dicatat_pada, karena penghapusan berdasarkan umur berlaku lintas sensor dan
 *    indeks (sensor_id, dicatat_pada) yang ada tidak bisa dipakai.
 *
 * `tanggal` = tanggal kalender di zona config('lampu.zona_ringkasan') (default Asia/Jakarta).
 *
 * Kolom jumlah_lampu dan watt_per_lampu ada di migrasi create_node_sensors (bukan di sini).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ringkasan_telemetri_harian', function (Blueprint $table) {
            $table->foreignUuid('sensor_id')->constrained('node_sensors', 'id_sensor')->cascadeOnDelete();
            $table->date('tanggal');
            $table->float('lux_rata')->nullable();
            $table->float('lux_min')->nullable();
            $table->float('lux_maks')->nullable();
            $table->float('suhu_rata')->nullable();
            $table->float('suhu_min')->nullable();
            $table->float('suhu_maks')->nullable();
            $table->unsignedInteger('jumlah_sampel');
            $table->timestamps();

            $table->primary(['sensor_id', 'tanggal']);
        });

        Schema::create('ringkasan_energi_harian', function (Blueprint $table) {
            $table->foreignUuid('sensor_id')->constrained('node_sensors', 'id_sensor')->cascadeOnDelete();
            $table->date('tanggal');
            $table->decimal('kwh', 12, 6)->default(0);
            $table->float('watt_rata')->nullable();
            $table->float('watt_maks')->nullable();
            $table->unsignedInteger('jumlah_sampel');
            $table->timestamps();

            $table->primary(['sensor_id', 'tanggal']);
        });

        DB::statement('CREATE INDEX IF NOT EXISTS read__sensors_dicatat_pada_idx ON read__sensors (dicatat_pada)');
        DB::statement('CREATE INDEX IF NOT EXISTS log_energies_dicatat_pada_idx ON log_energies (dicatat_pada)');
        DB::statement('CREATE INDEX IF NOT EXISTS log_peredupans_dicatat_pada_idx ON log_peredupans (dicatat_pada)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS read__sensors_dicatat_pada_idx');
        DB::statement('DROP INDEX IF EXISTS log_energies_dicatat_pada_idx');
        DB::statement('DROP INDEX IF EXISTS log_peredupans_dicatat_pada_idx');

        Schema::dropIfExists('ringkasan_energi_harian');
        Schema::dropIfExists('ringkasan_telemetri_harian');
    }
};