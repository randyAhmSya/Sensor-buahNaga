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
        Schema::create('gateways', function (Blueprint $table) {
            $table->uuid('id_gateway')->primary();
            $table->foreignUuid('blok_id')->constrained('bloks', 'id_blok')->cascadeOnDelete();
            $table->string('kode_perangkat')->unique();
            $table->string('status_koneksi');
            $table->string('kode_pairing')->unique()->nullable()->after('kode_perangkat');
            $table->string('token_gateway')->unique()->nullable()->after('kode_pairing');
            $table->timestamp('terakhir_terlihat')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gateways');
        Schema::table('gateways', function (Blueprint $table) {
            $table->dropColumn(['kode_pairing', 'token_gateway']);
        });
    }
};
