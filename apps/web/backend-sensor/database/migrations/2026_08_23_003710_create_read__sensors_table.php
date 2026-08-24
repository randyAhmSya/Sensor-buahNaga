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
        Schema::create('read__sensors', function (Blueprint $table) {
            $table->uuid('id_read_sensor')->primary();
            $table->foreignUuid('sensor_id')->constrained('node_sensors', 'id_sensor')->cascadeOnDelete();
            $table->float('nilai_lux')->nullable();
            $table->float('suhu')->nullable();
            $table->timestamp('dicatat_pada');
            $table->timestamps();
            $table->index(['sensor_id', 'dicatat_pada']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('read__sensors');
    }
};
