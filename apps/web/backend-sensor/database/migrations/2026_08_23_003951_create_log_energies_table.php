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
        Schema::create('log_energies', function (Blueprint $table) {
            $table->uuid('id_log')->primary();
            $table->foreignUuid('sensor_id')->constrained('node_sensors', 'id_sensor')->cascadeOnDelete();
            $table->float('konsumsi_watt');
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
        Schema::dropIfExists('log_energies');
    }
};
