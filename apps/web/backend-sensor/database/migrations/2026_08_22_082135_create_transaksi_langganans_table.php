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
        Schema::create('transaksi_langganans', function (Blueprint $table) {
            $table->uuid('id_transaksi')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants', 'tenant_id')->cascadeOnDelete();
            $table->string('nama_paket');
            $table->integer('tambahan_hari')->default(0);
            $table->decimal('harga', 10, 2);
            $table->string('status_pembayaran');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_langganans');
    }
};
