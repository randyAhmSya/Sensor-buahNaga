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
        Schema::create('siklus_panens', function (Blueprint $table) {
            $table->uuid('id_siklus_panen')->primary();
            $table->foreignUuid('block_id')->constrained('bloks', 'id_blok')->cascadeOnDelete();
            $table->timestamp('tanggal_penyinaran');
            $table->integer('target_hari_berbunga')->nullable();
            $table->timestamp('estimasi_tanggal_panen')->nullable();
            $table->timestamp('tanggal_panen')->nullable();
            $table->string('status_siklus')->default('BERJALAN');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siklus_panens');
    }
};
