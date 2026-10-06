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
        Schema::create('paket_langganans', function (Blueprint $table) {
               $table->uuid('id_paket')->primary();
                $table->string('nama_paket');
                $table->integer('tambahan_hari');
                $table->decimal('harga', 10, 2);
                $table->boolean('status_aktif')->default(true);
                $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        
        Schema::dropIfExists('paket_langganans');
        Schema::table('transaksi_langganans', function (Blueprint $table) {
    $table->foreignUuid('paket_langganan_id')->nullable()->after('tenant_id')
        ->constrained('paket_langganans', 'id_paket')->nullOnDelete();
});
    }
};
