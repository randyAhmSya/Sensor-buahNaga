<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jadwal_lampus', function (Blueprint $table) {
            $table->uuid('id_jadwal_lampu')->primary();
            $table->foreignUuid('kebun_id')->nullable()->after('id_jadwal_lampu')->constrained('kebuns', 'id_kebun')->cascadeOnDelete();
            $table->foreignUuid('sensor_id')->nullable()->after('kebun_id')->constrained('node_sensors', 'id_sensor')->cascadeOnDelete();
            $table->time('jam_mulai_nyala')->after('sensor_id');
            $table->time('jam_akhir_nyala')->after('jam_mulai_nyala');
            $table->string('mode')->default('manual')->after('jam_akhir_nyala');
            $table->float('target_lux')->nullable()->after('instensitas_cahaya');
            $table->float('intensitas_minimum')->default(10)->after('target_lux');
            $table->boolean('status_aktif')->default(true)->after('intensitas_minimum');
            $table->text('keterangan')->nullable()->after('status_aktif');
            $table->float('instensitas_cahaya');
            $table->timestamps();
        });

        DB::statement('ALTER TABLE jadwal_lampus ALTER COLUMN instensitas_cahaya DROP NOT NULL');
 
        DB::statement("ALTER TABLE jadwal_lampus ADD CONSTRAINT jadwal_lampus_scope_check CHECK (
            (kebun_id IS NOT NULL AND sensor_id IS NULL) OR (kebun_id IS NULL AND sensor_id IS NOT NULL)
        )");

        DB::statement("ALTER TABLE jadwal_lampus ADD CONSTRAINT jadwal_lampus_mode_check CHECK (
            (mode = 'manual' AND instensitas_cahaya IS NOT NULL) OR
            (mode = 'auto' AND target_lux IS NOT NULL)
        )");
 
        DB::statement('CREATE UNIQUE INDEX jadwal_lampus_kebun_aktif_unique ON jadwal_lampus (kebun_id) WHERE status_aktif = true AND kebun_id IS NOT NULL');
        DB::statement('CREATE UNIQUE INDEX jadwal_lampus_sensor_aktif_unique ON jadwal_lampus (sensor_id) WHERE status_aktif = true AND sensor_id IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_lampus');
        DB::statement('DROP INDEX IF EXISTS jadwal_lampus_kebun_aktif_unique');
        DB::statement('DROP INDEX IF EXISTS jadwal_lampus_sensor_aktif_unique');
        DB::statement('ALTER TABLE jadwal_lampus DROP CONSTRAINT IF EXISTS jadwal_lampus_mode_check');
        DB::statement('ALTER TABLE jadwal_lampus DROP CONSTRAINT IF EXISTS jadwal_lampus_scope_check');
 
        Schema::table('jadwal_lampus', function (Blueprint $table) {
            $table->dropForeign(['kebun_id']);
            $table->dropForeign(['sensor_id']);
            $table->dropColumn(['kebun_id', 'sensor_id', 'jam_mulai_nyala', 'jam_akhir_nyala', 'mode', 'target_lux', 'intensitas_minimum', 'status_aktif', 'keterangan']);
        });
 
        Schema::table('jadwal_lampus', function (Blueprint $table) {
            $table->foreignUuid('sensor_id')->constrained('node_sensors', 'id_sensor')->cascadeOnDelete();
            $table->timestamp('waktu_mulai_nyala');
            $table->timestamp('waktu_akhir_nyala');
        });
 
        DB::statement('ALTER TABLE jadwal_lampus ALTER COLUMN instensitas_cahaya SET NOT NULL');
    }
};
