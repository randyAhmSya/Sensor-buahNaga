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
        Schema::create('log_aktivitas_admins', function (Blueprint $table) {
            $table->uuid('id_log')->primary();
            $table->foreignUuid('admin_id')->constrained('users', 'id')->cascadeOnDelete();
            $table->string('aksi');
            $table->string('target_tipe');
            $table->string('target_id');
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->index(['target_tipe', 'target_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_aktivitas_admins');
    }
};
