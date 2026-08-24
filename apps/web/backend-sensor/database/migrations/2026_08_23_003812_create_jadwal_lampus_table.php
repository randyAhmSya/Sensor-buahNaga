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
            $table->foreignUuid('sensor_id')->constrained('node_sensors', 'id_sensor')->cascadeOnDelete();
            $table->timestamp('waktu_mulai_nyala');
            $table->timestamp('waktu_akhir_nyala');
            $table->float('instensitas_cahaya');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_lampus');
    }
};
