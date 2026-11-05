<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
            $table->foreignUuid('qr_id')->nullable()->unique()->constrained('kode_qrs', 'id_qr')->nullOnDelete();
            $table->string('kode_perangkat')->unique();
            $table->string('kode_pairing')->unique()->nullable();
            $table->string('token_perangkat')->unique()->nullable();
            $table->string('tipe_sensor');
            $table->unsignedSmallInteger('jumlah_lampu')->default(1);
            $table->decimal('watt_per_lampu', 8, 2)->nullable();
            $table->string('status_koneksi');
            $table->timestamp('terakhir_terlihat')->nullable();
            $table->timestamps();
        });
        DB::statement('ALTER TABLE node_sensors ADD CONSTRAINT node_sensors_jumlah_lampu_check CHECK (jumlah_lampu >= 1)');
        DB::statement('ALTER TABLE node_sensors ADD CONSTRAINT node_sensors_watt_per_lampu_check CHECK (watt_per_lampu IS NULL OR watt_per_lampu >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('node_sensors', function (Blueprint $table) {
            $table->dropUnique(['qr_id']);
        });
        Schema::dropIfExists('node_sensors');
    }
};
