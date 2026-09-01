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
        Schema::create('node_sensors', function (Blueprint $table) {
            $table->uuid('id_sensor')->primary();
            $table->foreignUuid('blok_id')->unique()->constrained('bloks', 'id_blok')->cascadeOnDelete();
            $table->foreignUuid('gateway_id')->constrained('gateways', 'id_gateway')->cascadeOnDelete();
            $table->foreignUuid('qr_id')->constrained('kode_qrs', 'id_qr')->cascadeOnDelete();
            $table->string('kode_perangkat')->unique();
            $table->string('kode_pairing')->unique()->nullable();
            $table->string('token_perangkat')->unique()->nullable();
            $table->string('tipe_sensor');
            $table->string('status_koneksi');
            $table->timestamp('terakhir_terlihat')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('node_sensors');
    }
};
