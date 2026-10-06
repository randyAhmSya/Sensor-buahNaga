<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaksi_langganans', function (Blueprint $table) {
            $table->foreignUuid('paket_langganan_id')->nullable()->after('tenant_id')
                ->constrained('paket_langganans', 'id_paket')->nullOnDelete();
            $table->string('metode_pembayaran')->default('manual_transfer')->after('harga');
            $table->string('bukti_transfer')->nullable()->after('metode_pembayaran');
            $table->string('referensi_gateway')->nullable()->after('bukti_transfer');
            $table->foreignUuid('diverifikasi_oleh')->nullable()->after('referensi_gateway')
                ->constrained('users', 'id')->nullOnDelete();
            $table->timestamp('diverifikasi_pada')->nullable()->after('diverifikasi_oleh');
        });
    }

    public function down(): void
    {
        Schema::table('transaksi_langganans', function (Blueprint $table) {
            $table->dropForeign(['paket_langganan_id']);
            $table->dropForeign(['diverifikasi_oleh']);
            $table->dropColumn([
                'paket_langganan_id',
                'metode_pembayaran',
                'bukti_transfer',
                'referensi_gateway',
                'diverifikasi_oleh',
                'diverifikasi_pada',
            ]);
        });
    }
};