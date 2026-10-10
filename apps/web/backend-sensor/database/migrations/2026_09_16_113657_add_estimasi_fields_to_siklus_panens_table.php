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
        Schema::table('siklus_panens', function (Blueprint $table) {
            $table->timestamp('tanggal_berbunga_aktual')->nullable()->after('target_hari_berbunga');
            $table->integer('target_hari_panen_setelah_bunga')->default(50)->after('tanggal_berbunga_aktual');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siklus_panens', function (Blueprint $table) {
            $table->dropColumn(['tanggal_berbunga_aktual', 'target_hari_panen_setelah_bunga']);
        });
    }
};
