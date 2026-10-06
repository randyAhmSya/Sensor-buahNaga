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
        Schema::create('qr_scan_logs', function (Blueprint $table) {
            $table->uuid('id_scan_log')->primary();
            $table->foreignUuid('qr_id')->nullable()->constrained('kode_qrs', 'id_qr')->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users', 'id')->nullOnDelete();
            $table->string('nama_user_saat_scan')->nullable();
            $table->string('status_scan')->default('berhasil');

            $table->string('platform')->nullable(); // android, ios
            $table->string('ip_address', 45)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->timestamp('dicatat_pada');
            $table->timestamps();

            $table->index(['qr_id', 'dicatat_pada']);
            $table->index(['user_id', 'dicatat_pada']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_scan_logs');
    }
};
